import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for quiz submission
const submitQuizSchema = z.object({
  quizId: z.string().cuid(),
  lessonId: z.string().cuid(),
  childId: z.string().cuid(),
  answers: z.record(z.string(), z.string()), // questionId -> optionId
  timeSpent: z.number().min(0),
});

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // 2. Validation
    const body = await req.json();
    const validated = submitQuizSchema.parse(body);

    // 3. Verify the child belongs to the parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // 4. Get the quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: validated.quizId },
      include: {
        questions: true,
        lesson: {
          select: {
            id: true,
            title: true,
            chapter: {
              select: {
                course: {
                  select: {
                    id: true,
                    title: true,
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

    // 5. Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const answersDetail = quiz.questions.map((question) => {
      totalPoints += question.points;
      const selectedOptionId = validated.answers[question.id];
      const options = question.options as unknown as QuestionOption[];
      const correctOption = options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        selectedOptionId,
        isCorrect,
      };
    });

    const percentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    // 6. Save or update progress
    await prisma.progress.upsert({
      where: {
        childId_lessonId: {
          childId: validated.childId,
          lessonId: validated.lessonId,
        },
      },
      create: {
        childId: validated.childId,
        lessonId: validated.lessonId,
        quizScore: percentage,
        isCompleted: passed,
        timeSpent: validated.timeSpent,
      },
      update: {
        quizScore: percentage,
        isCompleted: passed,
        timeSpent: {
          increment: validated.timeSpent,
        },
        lastAccessedAt: new Date(),
      },
    });

    // 7. Generate AI feedback (optional, for premium or if AI is available)
    let aiExplanation: string | undefined;

    // Simple feedback generation based on score
    if (percentage >= 90) {
      aiExplanation = `Excellent travail ! Tu maitrises bien ce sujet avec ${correctCount}/${quiz.questions.length} bonnes reponses. Continue comme ca !`;
    } else if (percentage >= 70) {
      aiExplanation = `Tres bien ! Tu as obtenu ${correctCount}/${quiz.questions.length} bonnes reponses. Revois les questions que tu as manquees pour renforcer ta comprehension.`;
    } else if (percentage >= 50) {
      aiExplanation = `Pas mal ! Tu progresses avec ${correctCount}/${quiz.questions.length} bonnes reponses. Je te conseille de relire la lecon et de reessayer le quiz.`;
    } else {
      aiExplanation = `Ne te decourage pas ! Tu as obtenu ${correctCount}/${quiz.questions.length} bonnes reponses. Prends le temps de bien relire la lecon avant de reessayer.`;
    }

    // 8. Return result
    return NextResponse.json({
      success: true,
      result: {
        score: earnedPoints,
        totalPoints,
        percentage,
        passed,
        correctCount,
        totalQuestions: quiz.questions.length,
        answers: answersDetail,
      },
      aiExplanation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Quiz submit error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
