import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAnthropicClient,
  getParentInsightSystemPrompt,
  AI_MODEL,
  type AIInsightsResponse,
} from "@/lib/ai";
import { z, ZodError } from "zod";

const insightsSchema = z.object({
  childId: z.string().cuid(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const { childId } = insightsSchema.parse(searchParams);

    // Verify parent owns child
    const child = await prisma.child.findFirst({
      where: { id: childId, parentId: session.user.id },
      include: {
        purchases: {
          where: { status: "COMPLETED" },
          include: {
            course: { select: { id: true, title: true, subject: true } },
          },
        },
        progress: {
          orderBy: { updatedAt: "desc" },
          take: 50,
          include: {
            lesson: {
              include: {
                chapter: {
                  include: {
                    course: { select: { title: true, subject: true } },
                  },
                },
              },
            },
          },
        },
        conversations: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { createdAt: true, title: true },
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Calculate metrics for AI context
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    const recentProgress = child.progress.filter(
      (p) => new Date(p.updatedAt) >= weekAgo,
    );
    const monthProgress = child.progress.filter(
      (p) => new Date(p.updatedAt) >= monthAgo,
    );

    const lessonsThisWeek = recentProgress.filter((p) => p.isCompleted).length;
    const lessonsThisMonth = monthProgress.filter((p) => p.isCompleted).length;
    const timeThisWeek = recentProgress.reduce(
      (sum, p) => sum + p.timeSpent,
      0,
    );
    const timeThisMonth = monthProgress.reduce(
      (sum, p) => sum + p.timeSpent,
      0,
    );

    const quizScoresWeek = recentProgress
      .filter((p) => p.quizScore !== null)
      .map((p) => p.quizScore as number);
    const quizScoresMonth = monthProgress
      .filter((p) => p.quizScore !== null)
      .map((p) => p.quizScore as number);

    const avgQuizWeek =
      quizScoresWeek.length > 0
        ? Math.round(
            quizScoresWeek.reduce((a, b) => a + b, 0) / quizScoresWeek.length,
          )
        : null;
    const avgQuizMonth =
      quizScoresMonth.length > 0
        ? Math.round(
            quizScoresMonth.reduce((a, b) => a + b, 0) / quizScoresMonth.length,
          )
        : null;

    // Subjects analysis
    const subjectPerformance = new Map<
      string,
      { scores: number[]; lessons: number }
    >();
    monthProgress.forEach((p) => {
      const subject = p.lesson.chapter.course.subject;
      const current = subjectPerformance.get(subject) ?? {
        scores: [],
        lessons: 0,
      };
      if (p.quizScore !== null) {
        current.scores.push(p.quizScore);
      }
      if (p.isCompleted) {
        current.lessons++;
      }
      subjectPerformance.set(subject, current);
    });

    const subjectSummary = Array.from(subjectPerformance.entries()).map(
      ([subject, data]) => ({
        subject,
        avgScore:
          data.scores.length > 0
            ? Math.round(
                data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
              )
            : null,
        lessonsCompleted: data.lessons,
      }),
    );

    // Activity patterns
    const daysSinceLastActivity =
      child.progress.length > 0
        ? Math.floor(
            (Date.now() - new Date(child.progress[0].updatedAt).getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;

    const aiConversationsCount = child.conversations.length;

    // Build context for AI
    const context = {
      childName: child.firstName,
      gradeLevel: child.gradeLevel,
      coursesEnrolled: child.purchases.map((p) => p.course.title),
      metrics: {
        lessonsThisWeek,
        lessonsThisMonth,
        timeThisWeekMinutes: Math.round(timeThisWeek / 60),
        timeThisMonthMinutes: Math.round(timeThisMonth / 60),
        avgQuizScoreWeek: avgQuizWeek,
        avgQuizScoreMonth: avgQuizMonth,
        daysSinceLastActivity,
        aiConversationsCount,
      },
      subjectPerformance: subjectSummary,
    };

    // Call Claude for insights
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: getParentInsightSystemPrompt(),
      messages: [
        {
          role: "user",
          content: `Analyse les donnees suivantes et genere des insights pour les parents:\n\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    });

    // Parse response
    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Invalid AI response");
    }

    let insights: AIInsightsResponse;
    try {
      insights = JSON.parse(textContent.text);
    } catch {
      // If AI didn't return valid JSON, create a fallback response
      insights = {
        summary: `${child.firstName} a complete ${lessonsThisWeek} leçons cette semaine.`,
        insights: [
          {
            type: "suggestion",
            title: "Continuez l'effort",
            description:
              "Encouragez votre enfant a maintenir un rythme regulier d'apprentissage.",
            actionable: "Fixez un horaire d'etude quotidien de 20-30 minutes.",
          },
        ],
        weeklyGoal: "Completer au moins 3 leçons cette semaine",
        encouragement: `Continue comme ca ${child.firstName} !`,
      };
    }

    return NextResponse.json({
      childId: child.id,
      childName: child.firstName,
      generatedAt: new Date().toISOString(),
      context,
      insights,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Parametres invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Insights error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
