import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ quizId: string }>;
}

// GET /api/quizzes/[quizId] - Get quiz by ID
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { position: "asc" },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                id: true,
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    gradeLevel: true,
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz non trouve" }, { status: 404 });
    }

    // Verify user has access (purchased the course)
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        courseId: quiz.lesson.chapter.course.id,
        status: "COMPLETED",
      },
    });

    if (!purchase && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acces non autorise" },
        { status: 403 },
      );
    }

    // Format questions to remove isCorrect from options for non-submitted quizzes
    // (to prevent cheating by inspecting network requests)
    const formattedQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: (
        q.options as { id: string; text: string; isCorrect: boolean }[]
      ).map((opt) => ({
        id: opt.id,
        text: opt.text,
        // isCorrect is intentionally omitted
      })),
      points: q.points,
      position: q.position,
      // explanation is omitted until after submission
    }));

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      questions: formattedQuestions,
      lesson: quiz.lesson,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
