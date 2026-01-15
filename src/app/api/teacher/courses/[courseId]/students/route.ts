import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
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
      select: {
        id: true,
        authorId: true,
        title: true,
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    if (course.authorId !== session.user.id) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    // Get all lessons for this course (for progress calculation)
    const lessons = await prisma.lesson.findMany({
      where: {
        chapter: { courseId },
        isPublished: true,
      },
      select: { id: true },
    });

    const lessonIds = lessons.map((l) => l.id);
    const totalLessons = lessonIds.length;

    // Get all quizzes for this course
    const quizzes = await prisma.quiz.findMany({
      where: {
        lesson: {
          chapter: { courseId },
        },
      },
      select: { id: true },
    });

    const quizIds = quizzes.map((q) => q.id);

    // Get all enrolled students (via purchases)
    const purchases = await prisma.purchase.findMany({
      where: {
        courseId,
        status: "COMPLETED",
      },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            gradeLevel: true,
            xp: true,
            level: true,
            currentStreak: true,
            lastActivityAt: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get progress and quiz data for all children
    const childIds = purchases
      .map((p) => p.childId)
      .filter(Boolean) as string[];

    const [progressRecords, quizAttempts] = await Promise.all([
      prisma.progress.findMany({
        where: {
          childId: { in: childIds },
          lessonId: { in: lessonIds },
        },
        select: {
          childId: true,
          lessonId: true,
          isCompleted: true,
          timeSpent: true,
          lastAccessedAt: true,
        },
      }),
      prisma.quizAttempt.findMany({
        where: {
          childId: { in: childIds },
          quizId: { in: quizIds },
        },
        select: {
          childId: true,
          quizId: true,
          score: true,
          totalPoints: true,
          percentage: true,
          passed: true,
          completedAt: true,
        },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    // Group data by child
    const progressByChild = new Map<string, typeof progressRecords>();
    const quizzesByChild = new Map<string, typeof quizAttempts>();

    for (const p of progressRecords) {
      const existing = progressByChild.get(p.childId) || [];
      existing.push(p);
      progressByChild.set(p.childId, existing);
    }

    for (const q of quizAttempts) {
      const existing = quizzesByChild.get(q.childId) || [];
      existing.push(q);
      quizzesByChild.set(q.childId, existing);
    }

    // Build student data with calculated metrics
    const students = purchases
      .filter((p) => p.child)
      .map((purchase) => {
        const child = purchase.child!;
        const progress = progressByChild.get(child.id) || [];
        const quizData = quizzesByChild.get(child.id) || [];

        // Calculate progress metrics
        const completedLessons = progress.filter((p) => p.isCompleted).length;
        const progressPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        // Calculate total time spent
        const totalTimeSpent = progress.reduce(
          (sum, p) => sum + p.timeSpent,
          0,
        );

        // Calculate quiz performance
        const quizAttemptCount = quizData.length;
        const avgQuizScore =
          quizAttemptCount > 0
            ? Math.round(
                quizData.reduce((sum, q) => sum + q.percentage, 0) /
                  quizAttemptCount,
              )
            : null;
        const passedQuizzes = quizData.filter((q) => q.passed).length;

        // Get last activity
        const lastAccessed = progress
          .map((p) => new Date(p.lastAccessedAt))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const lastQuizDate = quizData
          .map((q) => new Date(q.completedAt))
          .sort((a, b) => b.getTime() - a.getTime())[0];

        const lastActivity = [lastAccessed, lastQuizDate, child.lastActivityAt]
          .filter(Boolean)
          .sort((a, b) => (b?.getTime() ?? 0) - (a?.getTime() ?? 0))[0];

        // Determine engagement level
        let engagementLevel: "high" | "medium" | "low" | "inactive" =
          "inactive";
        if (lastActivity) {
          const daysSinceActivity = Math.floor(
            (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysSinceActivity <= 2) engagementLevel = "high";
          else if (daysSinceActivity <= 7) engagementLevel = "medium";
          else if (daysSinceActivity <= 14) engagementLevel = "low";
        }

        return {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          avatarUrl: child.avatarUrl,
          gradeLevel: child.gradeLevel,
          xp: child.xp,
          level: child.level,
          currentStreak: child.currentStreak,
          enrolledAt: purchase.createdAt,
          parentName: purchase.user.name,
          parentEmail: purchase.user.email,
          progress: {
            completedLessons,
            totalLessons,
            percentage: progressPercentage,
            totalTimeSpent,
          },
          quizPerformance: {
            attemptCount: quizAttemptCount,
            averageScore: avgQuizScore,
            passedCount: passedQuizzes,
            totalQuizzes: quizIds.length,
          },
          lastActivity,
          engagementLevel,
        };
      });

    // Calculate course-level stats
    const courseStats = {
      totalStudents: students.length,
      avgProgress:
        students.length > 0
          ? Math.round(
              students.reduce((sum, s) => sum + s.progress.percentage, 0) /
                students.length,
            )
          : 0,
      avgQuizScore: (() => {
        const studentsWithScores = students.filter(
          (s) => s.quizPerformance.averageScore !== null,
        );
        if (studentsWithScores.length === 0) return null;
        return Math.round(
          studentsWithScores.reduce(
            (sum, s) => sum + (s.quizPerformance.averageScore ?? 0),
            0,
          ) / studentsWithScores.length,
        );
      })(),
      completionRate:
        students.length > 0
          ? Math.round(
              (students.filter((s) => s.progress.percentage === 100).length /
                students.length) *
                100,
            )
          : 0,
      engagementBreakdown: {
        high: students.filter((s) => s.engagementLevel === "high").length,
        medium: students.filter((s) => s.engagementLevel === "medium").length,
        low: students.filter((s) => s.engagementLevel === "low").length,
        inactive: students.filter((s) => s.engagementLevel === "inactive")
          .length,
      },
    };

    return NextResponse.json({
      courseTitle: course.title,
      students,
      stats: courseStats,
    });
  } catch (error) {
    console.error("Teacher students API Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des étudiants" },
      { status: 500 },
    );
  }
}
