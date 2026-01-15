import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const engagement = searchParams.get("engagement"); // high, medium, low, inactive
    const sortBy = searchParams.get("sortBy") || "lastActivity"; // lastActivity, progress, quizScore

    // Get all courses by this teacher
    const teacherCourses = await prisma.course.findMany({
      where: { authorId: session.user.id },
      select: {
        id: true,
        title: true,
        slug: true,
        subject: true,
        gradeLevel: true,
      },
    });

    const courseIds = courseId ? [courseId] : teacherCourses.map((c) => c.id);

    // Get all published lessons across teacher's courses
    const lessons = await prisma.lesson.findMany({
      where: {
        chapter: { courseId: { in: courseIds } },
        isPublished: true,
      },
      select: { id: true, chapter: { select: { courseId: true } } },
    });

    const lessonIdsByCourse = new Map<string, string[]>();
    for (const lesson of lessons) {
      const existing = lessonIdsByCourse.get(lesson.chapter.courseId) || [];
      existing.push(lesson.id);
      lessonIdsByCourse.set(lesson.chapter.courseId, existing);
    }

    // Get all quizzes
    const quizzes = await prisma.quiz.findMany({
      where: {
        lesson: { chapter: { courseId: { in: courseIds } } },
      },
      select: {
        id: true,
        lesson: { select: { chapter: { select: { courseId: true } } } },
      },
    });

    const quizIdsByCourse = new Map<string, string[]>();
    for (const quiz of quizzes) {
      const cId = quiz.lesson.chapter.courseId;
      const existing = quizIdsByCourse.get(cId) || [];
      existing.push(quiz.id);
      quizIdsByCourse.set(cId, existing);
    }

    // Get all purchases (enrolled students)
    const purchases = await prisma.purchase.findMany({
      where: {
        courseId: { in: courseIds },
        status: "COMPLETED",
        childId: { not: null },
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
            longestStreak: true,
            lastActivityAt: true,
            weakAreas: {
              where: { isResolved: false },
              select: {
                subject: true,
                topic: true,
                difficulty: true,
              },
              take: 5,
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            subject: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const childIds = purchases
      .map((p) => p.childId)
      .filter(Boolean) as string[];

    const allLessonIds = Array.from(lessonIdsByCourse.values()).flat();
    const allQuizIds = Array.from(quizIdsByCourse.values()).flat();

    // Get progress and quiz data
    const [progressRecords, quizAttempts] = await Promise.all([
      prisma.progress.findMany({
        where: {
          childId: { in: childIds },
          lessonId: { in: allLessonIds },
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
          quizId: { in: allQuizIds },
        },
        select: {
          childId: true,
          quizId: true,
          percentage: true,
          passed: true,
          completedAt: true,
        },
        orderBy: { completedAt: "desc" },
      }),
    ]);

    // Group by child
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

    // Build student data with AI-ready insights
    const studentsMap = new Map<
      string,
      {
        id: string;
        firstName: string;
        lastName: string | null;
        avatarUrl: string | null;
        gradeLevel: string;
        xp: number;
        level: number;
        currentStreak: number;
        longestStreak: number;
        lastActivityAt: Date | null;
        parentName: string | null;
        parentEmail: string | null;
        courses: Array<{
          id: string;
          title: string;
          slug: string;
          subject: string;
          enrolledAt: Date;
          progress: number;
          quizScore: number | null;
        }>;
        weakAreas: Array<{
          subject: string;
          topic: string;
          difficulty: string | null;
        }>;
        overallProgress: number;
        avgQuizScore: number | null;
        totalTimeSpent: number;
        engagementLevel: "high" | "medium" | "low" | "inactive";
        needsAttention: boolean;
        attentionReasons: string[];
      }
    >();

    for (const purchase of purchases) {
      if (!purchase.child) continue;

      const child = purchase.child;
      const existing = studentsMap.get(child.id);

      // Calculate course-specific metrics
      const courseLessonIds = lessonIdsByCourse.get(purchase.courseId) || [];
      const courseQuizIds = quizIdsByCourse.get(purchase.courseId) || [];
      const childProgress = progressByChild.get(child.id) || [];
      const childQuizzes = quizzesByChild.get(child.id) || [];

      const courseProgress = childProgress.filter((p) =>
        courseLessonIds.includes(p.lessonId),
      );
      const courseQuizAttempts = childQuizzes.filter((q) =>
        courseQuizIds.includes(q.quizId),
      );

      const completedLessons = courseProgress.filter(
        (p) => p.isCompleted,
      ).length;
      const progressPercent =
        courseLessonIds.length > 0
          ? Math.round((completedLessons / courseLessonIds.length) * 100)
          : 0;

      const courseQuizScore =
        courseQuizAttempts.length > 0
          ? Math.round(
              courseQuizAttempts.reduce((sum, q) => sum + q.percentage, 0) /
                courseQuizAttempts.length,
            )
          : null;

      const courseData = {
        id: purchase.course.id,
        title: purchase.course.title,
        slug: purchase.course.slug,
        subject: purchase.course.subject,
        enrolledAt: purchase.createdAt,
        progress: progressPercent,
        quizScore: courseQuizScore,
      };

      if (existing) {
        existing.courses.push(courseData);
        continue;
      }

      // Calculate overall metrics
      const allChildProgress = childProgress;
      const allCompletedLessons = allChildProgress.filter(
        (p) => p.isCompleted,
      ).length;
      const totalLessonsForChild =
        allChildProgress.length > 0
          ? new Set(allChildProgress.map((p) => p.lessonId)).size
          : 0;
      const overallProgress =
        totalLessonsForChild > 0
          ? Math.round((allCompletedLessons / totalLessonsForChild) * 100)
          : 0;

      const totalTimeSpent = allChildProgress.reduce(
        (sum, p) => sum + p.timeSpent,
        0,
      );

      const avgQuizScore =
        childQuizzes.length > 0
          ? Math.round(
              childQuizzes.reduce((sum, q) => sum + q.percentage, 0) /
                childQuizzes.length,
            )
          : null;

      // Determine engagement level
      let engagementLevel: "high" | "medium" | "low" | "inactive" = "inactive";
      const lastActivity = child.lastActivityAt;
      if (lastActivity) {
        const daysSince = Math.floor(
          (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysSince <= 2) engagementLevel = "high";
        else if (daysSince <= 7) engagementLevel = "medium";
        else if (daysSince <= 14) engagementLevel = "low";
      }

      // Determine if student needs attention
      const attentionReasons: string[] = [];
      if (engagementLevel === "inactive") {
        attentionReasons.push("Inactif depuis plus de 14 jours");
      } else if (engagementLevel === "low") {
        attentionReasons.push("Activite en baisse");
      }
      if (avgQuizScore !== null && avgQuizScore < 50) {
        attentionReasons.push("Score quiz faible (<50%)");
      }
      if (child.weakAreas.length >= 3) {
        attentionReasons.push("Plusieurs points faibles detectes");
      }
      if (child.currentStreak === 0 && child.longestStreak > 5) {
        attentionReasons.push("Serie d'etude perdue");
      }

      studentsMap.set(child.id, {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        avatarUrl: child.avatarUrl,
        gradeLevel: child.gradeLevel,
        xp: child.xp,
        level: child.level,
        currentStreak: child.currentStreak,
        longestStreak: child.longestStreak,
        lastActivityAt: child.lastActivityAt,
        parentName: purchase.user.name,
        parentEmail: purchase.user.email,
        courses: [courseData],
        weakAreas: child.weakAreas.map(
          (w: {
            subject: string;
            topic: string;
            difficulty: string | null;
          }) => ({
            subject: w.subject,
            topic: w.topic,
            difficulty: w.difficulty,
          }),
        ),
        overallProgress,
        avgQuizScore,
        totalTimeSpent,
        engagementLevel,
        needsAttention: attentionReasons.length > 0,
        attentionReasons,
      });
    }

    let students = Array.from(studentsMap.values());

    // Filter by engagement if specified
    if (engagement) {
      students = students.filter((s) => s.engagementLevel === engagement);
    }

    // Sort students
    students.sort((a, b) => {
      switch (sortBy) {
        case "progress":
          return b.overallProgress - a.overallProgress;
        case "quizScore":
          return (b.avgQuizScore ?? 0) - (a.avgQuizScore ?? 0);
        case "attention":
          // Students needing attention first
          if (a.needsAttention && !b.needsAttention) return -1;
          if (!a.needsAttention && b.needsAttention) return 1;
          return b.attentionReasons.length - a.attentionReasons.length;
        case "lastActivity":
        default:
          const aTime = a.lastActivityAt?.getTime() ?? 0;
          const bTime = b.lastActivityAt?.getTime() ?? 0;
          return bTime - aTime;
      }
    });

    // Calculate aggregate stats
    const totalStudents = students.length;
    const studentsNeedingAttention = students.filter(
      (s) => s.needsAttention,
    ).length;
    const avgProgress =
      totalStudents > 0
        ? Math.round(
            students.reduce((sum, s) => sum + s.overallProgress, 0) /
              totalStudents,
          )
        : 0;
    const studentsWithScores = students.filter((s) => s.avgQuizScore !== null);
    const avgQuizScore =
      studentsWithScores.length > 0
        ? Math.round(
            studentsWithScores.reduce(
              (sum, s) => sum + (s.avgQuizScore ?? 0),
              0,
            ) / studentsWithScores.length,
          )
        : null;

    const engagementBreakdown = {
      high: students.filter((s) => s.engagementLevel === "high").length,
      medium: students.filter((s) => s.engagementLevel === "medium").length,
      low: students.filter((s) => s.engagementLevel === "low").length,
      inactive: students.filter((s) => s.engagementLevel === "inactive").length,
    };

    return NextResponse.json({
      students,
      courses: teacherCourses,
      stats: {
        totalStudents,
        studentsNeedingAttention,
        avgProgress,
        avgQuizScore,
        engagementBreakdown,
        totalCourses: teacherCourses.length,
      },
    });
  } catch (error) {
    console.error("Teacher students API Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des étudiants" },
      { status: 500 },
    );
  }
}
