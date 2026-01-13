import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateWeeklyReport,
  getWeekBounds,
  getPreviousWeekBounds,
} from "@/lib/ai-weekly-report";
import { z, ZodError } from "zod";
import type { Prisma } from "@prisma/client";

const generateReportSchema = z.object({
  childId: z.string().cuid(),
  weekOffset: z.number().int().min(-12).max(0).default(0), // How many weeks back (0 = current)
});

// GET - Retrieve weekly reports for a child
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");

    if (!childId) {
      return NextResponse.json({ error: "childId requis" }, { status: 400 });
    }

    // Verify parent owns this child
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Get last 4 weekly reports
    const reports = await prisma.weeklyReport.findMany({
      where: { childId },
      orderBy: { weekStart: "desc" },
      take: 4,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching weekly reports:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Generate or regenerate a weekly report
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const { childId, weekOffset } = generateReportSchema.parse(body);

    // Verify parent owns this child
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
      include: {
        progress: {
          include: {
            lesson: {
              include: {
                chapter: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Calculate week bounds
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + weekOffset * 7);
    const { weekStart, weekEnd } = getWeekBounds(targetDate);

    // Get previous week for comparison
    const prevWeek = getPreviousWeekBounds(targetDate);

    // Get progress data for the target week
    const weekProgress = await prisma.progress.findMany({
      where: {
        childId,
        lastAccessedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    // Get previous week progress for comparison
    const prevWeekProgress = await prisma.progress.findMany({
      where: {
        childId,
        lastAccessedAt: {
          gte: prevWeek.weekStart,
          lte: prevWeek.weekEnd,
        },
      },
    });

    // Calculate stats for current week
    const lessonsCompleted = weekProgress.filter((p) => p.isCompleted).length;
    const quizzesCompleted = weekProgress.filter(
      (p) => p.quizScore !== null,
    ).length;
    const quizScores = weekProgress
      .filter((p) => p.quizScore !== null)
      .map((p) => p.quizScore!);
    const avgQuizScore =
      quizScores.length > 0
        ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length
        : null;
    const totalTime = Math.round(
      weekProgress.reduce((sum, p) => sum + p.timeSpent, 0) / 60,
    );

    // Calculate comparison with previous week
    const prevLessonsCompleted = prevWeekProgress.filter(
      (p) => p.isCompleted,
    ).length;
    const prevTotalTime = Math.round(
      prevWeekProgress.reduce((sum, p) => sum + p.timeSpent, 0) / 60,
    );

    const lessonsDelta = lessonsCompleted - prevLessonsCompleted;
    const timeDelta = totalTime - prevTotalTime;

    // Get unique subjects and courses studied this week
    const subjects = [
      ...new Set(weekProgress.map((p) => p.lesson.chapter.course.subject)),
    ];
    const courses = [
      ...new Set(weekProgress.map((p) => p.lesson.chapter.course.title)),
    ];

    // Calculate streak days for this week (simplified - based on unique days with activity)
    const activeDays = new Set(
      weekProgress.map((p) => p.lastAccessedAt.toISOString().split("T")[0]),
    );
    const streakDays = activeDays.size;

    // Estimate XP earned (simplified calculation)
    const xpEarned =
      lessonsCompleted * 50 +
      quizzesCompleted * 25 +
      (avgQuizScore && avgQuizScore >= 80 ? quizzesCompleted * 15 : 0);

    // Generate AI report
    const aiReport = await generateWeeklyReport({
      childName: child.firstName,
      gradeLevel: child.gradeLevel,
      lessonsCompleted,
      quizzesCompleted,
      avgQuizScore,
      totalTime,
      xpEarned,
      streakDays,
      lessonsDelta,
      timeDelta,
      subjects,
      courses,
    });

    // Upsert the report
    const report = await prisma.weeklyReport.upsert({
      where: {
        childId_weekStart: {
          childId,
          weekStart,
        },
      },
      update: {
        lessonsCompleted,
        quizzesCompleted,
        averageQuizScore: avgQuizScore,
        totalTimeSpent: totalTime,
        xpEarned,
        streakDays,
        lessonsCompletedDelta: lessonsDelta,
        timeSpentDelta: timeDelta,
        summary: aiReport.summary,
        strengths: aiReport.strengths as Prisma.InputJsonValue,
        areasToImprove: aiReport.areasToImprove as Prisma.InputJsonValue,
        recommendations:
          aiReport.recommendations as unknown as Prisma.InputJsonValue,
        encouragement: aiReport.encouragement,
        parentTips: aiReport.parentTips,
        updatedAt: new Date(),
      },
      create: {
        childId,
        weekStart,
        weekEnd,
        lessonsCompleted,
        quizzesCompleted,
        averageQuizScore: avgQuizScore,
        totalTimeSpent: totalTime,
        xpEarned,
        streakDays,
        lessonsCompletedDelta: lessonsDelta,
        timeSpentDelta: timeDelta,
        summary: aiReport.summary,
        strengths: aiReport.strengths as Prisma.InputJsonValue,
        areasToImprove: aiReport.areasToImprove as Prisma.InputJsonValue,
        recommendations:
          aiReport.recommendations as unknown as Prisma.InputJsonValue,
        encouragement: aiReport.encouragement,
        parentTips: aiReport.parentTips,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error generating weekly report:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
