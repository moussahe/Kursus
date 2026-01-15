import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnthropicClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/ai";

interface RouteParams {
  params: Promise<{ childId: string }>;
}

function getStudentInsightsSystemPrompt(): string {
  return `Tu es un assistant pedagogique expert pour Schoolaris, une plateforme educative francaise.
Tu analyses les donnees d'un eleve individuel pour aider le professeur a mieux l'accompagner.

TON ROLE:
- Identifier les forces et faiblesses de l'eleve
- Suggerer des actions concretes pour le professeur
- Proposer des messages personnalises a envoyer au parent
- Anticiper les risques de decrochage

FORMAT DE REPONSE (JSON uniquement):
{
  "summary": "Resume en 2-3 phrases du profil de l'eleve",
  "strengths": ["Force 1", "Force 2"],
  "challenges": ["Defi 1", "Defi 2"],
  "recommendations": [
    {
      "type": "action" | "content" | "communication",
      "priority": "high" | "medium" | "low",
      "title": "Titre court",
      "description": "Description detaillee",
      "actionable": "Ce que le prof peut faire concretement"
    }
  ],
  "parentMessage": {
    "tone": "encouragement" | "alert" | "celebration",
    "subject": "Objet suggere pour email/message",
    "body": "Corps du message suggere (2-3 phrases)"
  },
  "riskLevel": "low" | "medium" | "high",
  "riskFactors": ["Facteur 1 si applicable"]
}

REGLES:
- Reponds UNIQUEMENT en JSON valide
- Sois constructif et bienveillant
- Maximum 4 recommandations
- Le message parent doit etre professionnel et rassurant
- Base tes analyses sur les donnees fournies`;
}

export interface StudentRecommendation {
  type: "action" | "content" | "communication";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionable: string;
}

export interface StudentInsightsResponse {
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: StudentRecommendation[];
  parentMessage: {
    tone: "encouragement" | "alert" | "celebration";
    subject: string;
    body: string;
  };
  riskLevel: "low" | "medium" | "high";
  riskFactors: string[];
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

    const { childId } = await params;

    // Verify teacher has access to this student (via course enrollment)
    const teacherCourses = await prisma.course.findMany({
      where: { authorId: session.user.id },
      select: { id: true },
    });

    const courseIds = teacherCourses.map((c) => c.id);

    const enrollment = await prisma.purchase.findFirst({
      where: {
        childId,
        courseId: { in: courseIds },
        status: "COMPLETED",
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Élève non trouve ou non inscrit a vos cours" },
        { status: 404 },
      );
    }

    // Get comprehensive student data
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        parent: {
          select: { name: true, email: true },
        },
        weakAreas: {
          where: { isResolved: false },
          orderBy: { lastErrorAt: "desc" },
          take: 10,
        },
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
          take: 5,
        },
        studyGoals: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Élève non trouve" }, { status: 404 });
    }

    // Get all enrollments for this child in teacher's courses
    const enrollments = await prisma.purchase.findMany({
      where: {
        childId,
        courseId: { in: courseIds },
        status: "COMPLETED",
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            subject: true,
            gradeLevel: true,
          },
        },
      },
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);

    // Get lessons for enrolled courses
    const lessons = await prisma.lesson.findMany({
      where: {
        chapter: { courseId: { in: enrolledCourseIds } },
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        chapter: { select: { courseId: true, title: true } },
      },
    });

    const lessonIds = lessons.map((l) => l.id);

    // Get quizzes
    const quizzes = await prisma.quiz.findMany({
      where: {
        lesson: { chapter: { courseId: { in: enrolledCourseIds } } },
      },
      select: {
        id: true,
        lesson: {
          select: { title: true, chapter: { select: { courseId: true } } },
        },
      },
    });

    const quizIds = quizzes.map((q) => q.id);

    // Get progress data
    const progressData = await prisma.progress.findMany({
      where: {
        childId,
        lessonId: { in: lessonIds },
      },
      orderBy: { lastAccessedAt: "desc" },
    });

    // Get quiz attempts
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: {
        childId,
        quizId: { in: quizIds },
      },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    // Calculate metrics
    const completedLessons = progressData.filter((p) => p.isCompleted).length;
    const totalLessons = lessonIds.length;
    const progressPercent =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    const totalTimeSpent = progressData.reduce(
      (sum, p) => sum + p.timeSpent,
      0,
    );

    const quizScores = quizAttempts.map((q) => q.percentage);
    const avgQuizScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

    const passedQuizzes = quizAttempts.filter((q) => q.passed).length;
    const quizPassRate =
      quizAttempts.length > 0
        ? Math.round((passedQuizzes / quizAttempts.length) * 100)
        : null;

    // Recent activity trend
    const last7DaysProgress = progressData.filter((p) => {
      const daysDiff =
        (Date.now() - p.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const last30DaysProgress = progressData.filter((p) => {
      const daysDiff =
        (Date.now() - p.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 30;
    });

    // Quiz score trend
    const recentQuizzes = quizAttempts.slice(0, 5);
    const olderQuizzes = quizAttempts.slice(5, 10);

    const recentAvg =
      recentQuizzes.length > 0
        ? recentQuizzes.reduce((sum, q) => sum + q.percentage, 0) /
          recentQuizzes.length
        : null;
    const olderAvg =
      olderQuizzes.length > 0
        ? olderQuizzes.reduce((sum, q) => sum + q.percentage, 0) /
          olderQuizzes.length
        : null;

    let scoreTrend: "improving" | "declining" | "stable" = "stable";
    if (recentAvg !== null && olderAvg !== null) {
      if (recentAvg > olderAvg + 10) scoreTrend = "improving";
      else if (recentAvg < olderAvg - 10) scoreTrend = "declining";
    }

    // Build data summary for AI
    const dataSummary = {
      student: {
        firstName: child.firstName,
        gradeLevel: child.gradeLevel,
        xp: child.xp,
        level: child.level,
        currentStreak: child.currentStreak,
        longestStreak: child.longestStreak,
        lastActivityAt: child.lastActivityAt?.toISOString() || null,
      },
      parent: {
        name: child.parent.name,
      },
      enrolledCourses: enrollments.map((e) => ({
        title: e.course.title,
        subject: e.course.subject,
        enrolledAt: e.createdAt.toISOString(),
      })),
      performance: {
        progressPercent,
        completedLessons,
        totalLessons,
        avgQuizScore,
        quizPassRate,
        totalQuizAttempts: quizAttempts.length,
        totalTimeSpentMinutes: Math.round(totalTimeSpent / 60),
        scoreTrend,
      },
      activity: {
        lessonsLast7Days: last7DaysProgress.length,
        lessonsLast30Days: last30DaysProgress.length,
        daysSinceLastActivity: child.lastActivityAt
          ? Math.floor(
              (Date.now() - child.lastActivityAt.getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : null,
      },
      weakAreas: child.weakAreas.map((w) => ({
        subject: w.subject,
        topic: w.topic,
        difficulty: w.difficulty,
      })),
      achievements: {
        totalBadges: child.badges.length,
        recentBadges: child.badges.slice(0, 3).map((b) => b.badge.name),
      },
      goals: child.studyGoals.map((g) => ({
        type: g.type,
        target: g.target,
        currentValue: g.currentValue,
        isCompleted: g.isCompleted,
      })),
    };

    // Generate AI insights
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: getStudentInsightsSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `Analyse les donnees suivantes de l'eleve ${child.firstName} et fournis des insights personnalises pour m'aider a mieux l'accompagner:

${JSON.stringify(dataSummary, null, 2)}

Genere une analyse JSON avec des recommandations concretes.`,
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

    const insights: StudentInsightsResponse = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      childId,
      childName: `${child.firstName} ${child.lastName || ""}`.trim(),
      parentName: child.parent.name,
      insights,
      rawMetrics: {
        progressPercent,
        avgQuizScore,
        totalTimeSpent,
        currentStreak: child.currentStreak,
        weakAreasCount: child.weakAreas.length,
      },
    });
  } catch (error) {
    console.error("Student insights API Error:", error);

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
