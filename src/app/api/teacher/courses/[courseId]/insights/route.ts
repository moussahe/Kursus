import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnthropicClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/ai";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// System prompt for teacher course insights
function getTeacherInsightsSystemPrompt(): string {
  return `Tu es un assistant pedagogique expert pour Schoolaris, une plateforme educative francaise.
Tu analyses les donnees de progression des étudiants d'un cours pour aider le professeur a ameliorer son enseignement.

TON ROLE:
- Analyser les patterns de performance des étudiants
- Identifier les leçons/quizzes problematiques ou les plus forts taux d'abandon
- Suggerer des ameliorations pedagogiques concretes
- Mettre en evidence les succes et les points d'attention

FORMAT DE REPONSE (JSON uniquement):
{
  "summary": "Resume en 2-3 phrases de la situation globale du cours",
  "insights": [
    {
      "type": "success" | "warning" | "improvement" | "engagement",
      "title": "Titre court et accrocheur",
      "description": "Explication detaillee de l'observation",
      "action": "Conseil actionnable pour le professeur"
    }
  ],
  "topPerformingContent": "Quel contenu fonctionne le mieux et pourquoi",
  "areasNeedingAttention": "Quels contenus necessitent une revision",
  "nextSteps": ["Action 1", "Action 2", "Action 3"]
}

REGLES:
- Reponds UNIQUEMENT en JSON valide
- Sois constructif et orienté solutions
- Maximum 5 insights
- Base tes analyses sur les donnees fournies
- Si les donnees sont insuffisantes, indique-le clairement
- Les conseils doivent etre pratiques et realisables`;
}

export interface TeacherInsight {
  type: "success" | "warning" | "improvement" | "engagement";
  title: string;
  description: string;
  action: string;
}

export interface TeacherInsightsResponse {
  summary: string;
  insights: TeacherInsight[];
  topPerformingContent: string;
  areasNeedingAttention: string;
  nextSteps: string[];
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const { courseId } = await params;

    // Verify course ownership
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          include: {
            lessons: {
              where: { isPublished: true },
              include: {
                quizzes: true,
                _count: {
                  select: { progress: true },
                },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    if (course.authorId !== session.user.id) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    // Get all purchases for this course
    const purchases = await prisma.purchase.findMany({
      where: {
        courseId,
        status: "COMPLETED",
      },
      select: {
        childId: true,
        createdAt: true,
      },
    });

    const childIds = purchases
      .map((p) => p.childId)
      .filter(Boolean) as string[];
    const totalStudents = childIds.length;

    if (totalStudents === 0) {
      return NextResponse.json({
        summary: "Aucun étudiant inscrit pour le moment.",
        insights: [],
        topPerformingContent: "Pas encore de donnees disponibles",
        areasNeedingAttention: "Pas encore de donnees disponibles",
        nextSteps: ["Promouvoir votre cours pour attirer des étudiants"],
      });
    }

    // Get all lessons and quizzes
    const lessonIds = course.chapters.flatMap((c) =>
      c.lessons.map((l) => l.id),
    );
    const quizIds = course.chapters.flatMap((c) =>
      c.lessons.flatMap((l) => l.quizzes.map((q) => q.id)),
    );

    // Get progress data
    const progressData = await prisma.progress.findMany({
      where: {
        childId: { in: childIds },
        lessonId: { in: lessonIds },
      },
      select: {
        lessonId: true,
        isCompleted: true,
        timeSpent: true,
      },
    });

    // Get quiz data
    const quizData = await prisma.quizAttempt.findMany({
      where: {
        childId: { in: childIds },
        quizId: { in: quizIds },
      },
      select: {
        quizId: true,
        percentage: true,
        passed: true,
        timeSpent: true,
      },
    });

    // Build lesson stats
    const lessonStats = course.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => {
        const lessonProgress = progressData.filter(
          (p) => p.lessonId === lesson.id,
        );
        const completionCount = lessonProgress.filter(
          (p) => p.isCompleted,
        ).length;
        const avgTimeSpent =
          lessonProgress.length > 0
            ? Math.round(
                lessonProgress.reduce((sum, p) => sum + p.timeSpent, 0) /
                  lessonProgress.length,
              )
            : 0;

        const lessonQuizIds = lesson.quizzes.map((q) => q.id);
        const lessonQuizAttempts = quizData.filter((q) =>
          lessonQuizIds.includes(q.quizId),
        );
        const avgQuizScore =
          lessonQuizAttempts.length > 0
            ? Math.round(
                lessonQuizAttempts.reduce((sum, q) => sum + q.percentage, 0) /
                  lessonQuizAttempts.length,
              )
            : null;

        return {
          chapterTitle: chapter.title,
          lessonTitle: lesson.title,
          hasQuiz: lesson.quizzes.length > 0,
          viewCount: lessonProgress.length,
          completionCount,
          completionRate:
            totalStudents > 0
              ? Math.round((completionCount / totalStudents) * 100)
              : 0,
          avgTimeSpentMinutes: Math.round(avgTimeSpent / 60),
          avgQuizScore,
          quizAttempts: lessonQuizAttempts.length,
        };
      }),
    );

    // Calculate overall metrics
    const totalCompletions = progressData.filter((p) => p.isCompleted).length;
    const avgProgressPerStudent =
      lessonIds.length > 0 && totalStudents > 0
        ? Math.round(
            (totalCompletions / (lessonIds.length * totalStudents)) * 100,
          )
        : 0;

    const allQuizScores = quizData.map((q) => q.percentage);
    const avgQuizScore =
      allQuizScores.length > 0
        ? Math.round(
            allQuizScores.reduce((a, b) => a + b, 0) / allQuizScores.length,
          )
        : null;

    // Calculate engagement metrics
    const recentActivity = await prisma.progress.findMany({
      where: {
        childId: { in: childIds },
        lessonId: { in: lessonIds },
        lastAccessedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { childId: true },
    });

    const activeStudentsLast7Days = new Set(
      recentActivity.map((r) => r.childId),
    ).size;

    // Build data summary for AI
    const dataSummary = {
      courseTitle: course.title,
      totalStudents,
      avgProgressPerStudent,
      avgQuizScore,
      activeStudentsLast7Days,
      engagementRate: Math.round(
        (activeStudentsLast7Days / totalStudents) * 100,
      ),
      lessonStats: lessonStats.slice(0, 20), // Limit to avoid token overflow
      topLessons: lessonStats
        .filter((l) => l.completionRate > 0)
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 3),
      strugglingLessons: lessonStats
        .filter((l) => l.avgQuizScore !== null && l.avgQuizScore < 60)
        .sort((a, b) => (a.avgQuizScore ?? 0) - (b.avgQuizScore ?? 0))
        .slice(0, 3),
      lowCompletionLessons: lessonStats
        .filter((l) => l.completionRate < 50 && l.viewCount > 0)
        .sort((a, b) => a.completionRate - b.completionRate)
        .slice(0, 3),
    };

    // Generate AI insights
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: getTeacherInsightsSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `Analyse les donnees suivantes de mon cours et fournis des insights pedagogiques:

${JSON.stringify(dataSummary, null, 2)}

Genere une analyse JSON avec des conseils pratiques pour ameliorer mon cours.`,
        },
      ],
    });

    // Parse AI response
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Response vide de l'IA");
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Format de réponse invalide");
    }

    const insights: TeacherInsightsResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json(insights);
  } catch (error) {
    console.error("Teacher insights API Error:", error);

    // Return a fallback response if AI fails
    if (error instanceof Error && error.message.includes("JSON")) {
      return NextResponse.json(
        { error: "Erreur lors de l'analyse. Veuillez reessayer." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la generation des insights" },
      { status: 500 },
    );
  }
}
