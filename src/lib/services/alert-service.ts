import { prisma } from "@/lib/prisma";
import type { AlertType, AlertPriority, Prisma } from "@prisma/client";

interface AlertData {
  parentId: string;
  childId?: string;
  type: AlertType;
  priority?: AlertPriority;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
  actionUrl?: string;
  expiresAt?: Date;
}

export async function createAlert(data: AlertData) {
  return prisma.alert.create({
    data: {
      parentId: data.parentId,
      childId: data.childId,
      type: data.type,
      priority: data.priority ?? "MEDIUM",
      title: data.title,
      message: data.message,
      metadata: data.metadata,
      actionUrl: data.actionUrl,
      expiresAt: data.expiresAt,
    },
  });
}

export async function checkInactivityAlerts() {
  const inactivityThresholdDays = 3;
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - inactivityThresholdDays);

  // Find children who haven't had any progress in X days
  const inactiveChildren = await prisma.child.findMany({
    where: {
      purchases: { some: { status: "COMPLETED" } },
      progress: {
        none: { lastAccessedAt: { gte: thresholdDate } },
      },
    },
    include: {
      parent: { select: { id: true, name: true } },
      purchases: {
        where: { status: "COMPLETED" },
        include: { course: { select: { title: true } } },
      },
    },
  });

  const alerts: AlertData[] = [];

  for (const child of inactiveChildren) {
    // Check if alert already exists for this period
    const existingAlert = await prisma.alert.findFirst({
      where: {
        childId: child.id,
        type: "INACTIVITY",
        createdAt: { gte: thresholdDate },
        isDismissed: false,
      },
    });

    if (!existingAlert) {
      alerts.push({
        parentId: child.parentId,
        childId: child.id,
        type: "INACTIVITY",
        priority: "HIGH",
        title: `${child.firstName} n'a pas etudie depuis ${inactivityThresholdDays} jours`,
        message: `${child.firstName} n'a pas accede a ses cours depuis ${inactivityThresholdDays} jours. Un petit rappel pourrait l'encourager a reprendre ses lecons !`,
        metadata: {
          daysSinceActivity: inactivityThresholdDays,
          courses: child.purchases.map((p) => p.course.title),
        },
        actionUrl: `/parent/children/${child.id}`,
      });
    }
  }

  // Batch create alerts
  if (alerts.length > 0) {
    await prisma.alert.createMany({ data: alerts });
  }

  return alerts.length;
}

export async function checkLowQuizScoreAlerts() {
  const lowScoreThreshold = 50;
  const checkPeriod = new Date();
  checkPeriod.setHours(checkPeriod.getHours() - 24);

  // Find recent low quiz scores
  const recentLowScores = await prisma.progress.findMany({
    where: {
      quizScore: { lt: lowScoreThreshold, not: null },
      updatedAt: { gte: checkPeriod },
    },
    include: {
      child: { select: { id: true, firstName: true, parentId: true } },
      lesson: {
        include: {
          chapter: {
            include: { course: { select: { id: true, title: true } } },
          },
        },
      },
    },
  });

  const alerts: AlertData[] = [];

  for (const progress of recentLowScores) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        childId: progress.childId,
        type: "LOW_QUIZ_SCORE",
        metadata: { path: ["lessonId"], equals: progress.lessonId },
        isDismissed: false,
      },
    });

    if (!existingAlert && progress.quizScore !== null) {
      alerts.push({
        parentId: progress.child.parentId,
        childId: progress.childId,
        type: "LOW_QUIZ_SCORE",
        priority: "HIGH",
        title: `${progress.child.firstName} a obtenu ${progress.quizScore}% au quiz`,
        message: `${progress.child.firstName} a eu des difficultes avec le quiz "${progress.lesson.title}" du cours "${progress.lesson.chapter.course.title}". L'assistant IA peut l'aider a mieux comprendre cette lecon.`,
        metadata: {
          score: progress.quizScore,
          lessonId: progress.lessonId,
          lessonTitle: progress.lesson.title,
          courseId: progress.lesson.chapter.course.id,
          courseTitle: progress.lesson.chapter.course.title,
        },
        actionUrl: `/parent/courses/${progress.lesson.chapter.course.id}?childId=${progress.childId}`,
      });
    }
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({ data: alerts });
  }

  return alerts.length;
}

export async function checkMilestoneAlerts() {
  const checkPeriod = new Date();
  checkPeriod.setHours(checkPeriod.getHours() - 24);

  // Find children who completed a chapter recently
  const recentCompletions = await prisma.$queryRaw<
    Array<{
      childId: string;
      childFirstName: string;
      parentId: string;
      chapterId: string;
      chapterTitle: string;
      courseId: string;
      courseTitle: string;
      completedLessons: bigint;
      totalLessons: bigint;
    }>
  >`
    SELECT
      c.id as "childId",
      c."firstName" as "childFirstName",
      c."parentId" as "parentId",
      ch.id as "chapterId",
      ch.title as "chapterTitle",
      co.id as "courseId",
      co.title as "courseTitle",
      COUNT(CASE WHEN p."isCompleted" THEN 1 END) as "completedLessons",
      COUNT(l.id) as "totalLessons"
    FROM "Child" c
    JOIN "Progress" p ON p."childId" = c.id
    JOIN "Lesson" l ON l.id = p."lessonId"
    JOIN "Chapter" ch ON ch.id = l."chapterId"
    JOIN "Course" co ON co.id = ch."courseId"
    WHERE l."isPublished" = true
      AND ch."isPublished" = true
      AND p."updatedAt" >= ${checkPeriod}
    GROUP BY c.id, c."firstName", c."parentId", ch.id, ch.title, co.id, co.title
    HAVING COUNT(CASE WHEN p."isCompleted" THEN 1 END) = COUNT(l.id)
  `;

  const alerts: AlertData[] = [];

  for (const completion of recentCompletions) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        childId: completion.childId,
        type: "MILESTONE",
        metadata: { path: ["chapterId"], equals: completion.chapterId },
        isDismissed: false,
      },
    });

    if (!existingAlert) {
      alerts.push({
        parentId: completion.parentId,
        childId: completion.childId,
        type: "MILESTONE",
        priority: "LOW",
        title: `${completion.childFirstName} a termine un chapitre !`,
        message: `Felicitations ! ${completion.childFirstName} a complete le chapitre "${completion.chapterTitle}" du cours "${completion.courseTitle}". Continue comme ca !`,
        metadata: {
          chapterId: completion.chapterId,
          chapterTitle: completion.chapterTitle,
          courseId: completion.courseId,
          courseTitle: completion.courseTitle,
          lessonsCompleted: Number(completion.totalLessons),
        },
        actionUrl: `/parent/courses/${completion.courseId}?childId=${completion.childId}`,
      });
    }
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({ data: alerts });
  }

  return alerts.length;
}

export interface WeeklyStats {
  childId: string;
  childName: string;
  lessonsCompleted: number;
  totalTimeSpent: number;
  averageQuizScore: number | null;
  coursesProgress: Array<{
    courseId: string;
    courseTitle: string;
    progressPercent: number;
    lessonsThisWeek: number;
  }>;
  strengths: string[];
  areasToImprove: string[];
}

export async function generateWeeklyReport(
  parentId: string,
): Promise<WeeklyStats[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const children = await prisma.child.findMany({
    where: { parentId },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        include: {
          course: {
            include: {
              chapters: {
                where: { isPublished: true },
                include: {
                  lessons: { where: { isPublished: true } },
                },
              },
            },
          },
        },
      },
      progress: {
        where: { updatedAt: { gte: weekAgo } },
        include: {
          lesson: {
            include: {
              chapter: { include: { course: true } },
            },
          },
        },
      },
    },
  });

  return children.map((child) => {
    const lessonsCompleted = child.progress.filter((p) => p.isCompleted).length;
    const totalTimeSpent = child.progress.reduce(
      (sum, p) => sum + p.timeSpent,
      0,
    );
    const quizScores = child.progress
      .filter((p) => p.quizScore !== null)
      .map((p) => p.quizScore as number);
    const averageQuizScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

    const coursesProgress = child.purchases.map((purchase) => {
      const course = purchase.course;
      const totalLessons = course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0,
      );
      const lessonsThisWeek = child.progress.filter(
        (p) => p.lesson.chapter.courseId === course.id,
      ).length;

      return {
        courseId: course.id,
        courseTitle: course.title,
        progressPercent:
          totalLessons > 0
            ? Math.round((lessonsThisWeek / totalLessons) * 100)
            : 0,
        lessonsThisWeek,
      };
    });

    // Analyze strengths and areas to improve based on quiz scores
    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    const scoresBySubject = new Map<string, number[]>();
    child.progress.forEach((p) => {
      if (p.quizScore !== null) {
        const subject = p.lesson.chapter.course.subject;
        const scores = scoresBySubject.get(subject) ?? [];
        scores.push(p.quizScore);
        scoresBySubject.set(subject, scores);
      }
    });

    scoresBySubject.forEach((scores, subject) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg >= 80) {
        strengths.push(subject);
      } else if (avg < 60) {
        areasToImprove.push(subject);
      }
    });

    return {
      childId: child.id,
      childName: child.firstName,
      lessonsCompleted,
      totalTimeSpent,
      averageQuizScore,
      coursesProgress,
      strengths,
      areasToImprove,
    };
  });
}

export async function createWeeklyReportAlerts() {
  const parents = await prisma.user.findMany({
    where: {
      role: "PARENT",
      children: { some: { purchases: { some: { status: "COMPLETED" } } } },
    },
    select: { id: true },
  });

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  let alertsCreated = 0;

  for (const parent of parents) {
    // Check if weekly report already sent
    const existingReport = await prisma.alert.findFirst({
      where: {
        parentId: parent.id,
        type: "WEEKLY_REPORT",
        createdAt: { gte: weekStart },
      },
    });

    if (existingReport) continue;

    const stats = await generateWeeklyReport(parent.id);

    if (stats.length === 0) continue;

    const totalLessons = stats.reduce((sum, s) => sum + s.lessonsCompleted, 0);
    const totalTime = stats.reduce((sum, s) => sum + s.totalTimeSpent, 0);
    const avgScore = stats
      .filter((s) => s.averageQuizScore !== null)
      .map((s) => s.averageQuizScore as number);
    const overallAvg =
      avgScore.length > 0
        ? Math.round(avgScore.reduce((a, b) => a + b, 0) / avgScore.length)
        : null;

    const childrenSummary = stats
      .map((s) => `${s.childName}: ${s.lessonsCompleted} lecons`)
      .join(", ");

    await createAlert({
      parentId: parent.id,
      type: "WEEKLY_REPORT",
      priority: "MEDIUM",
      title: "Rapport hebdomadaire",
      message: `Cette semaine: ${totalLessons} lecons completees, ${Math.round(totalTime / 60)} min d'etude${overallAvg ? `, moyenne quiz: ${overallAvg}%` : ""}. (${childrenSummary})`,
      metadata: { stats: JSON.parse(JSON.stringify(stats)) },
      actionUrl: "/parent/children",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
    });

    alertsCreated++;
  }

  return alertsCreated;
}

export async function runAllAlertChecks() {
  const results = {
    inactivity: await checkInactivityAlerts(),
    lowQuizScore: await checkLowQuizScoreAlerts(),
    milestones: await checkMilestoneAlerts(),
    weeklyReports: await createWeeklyReportAlerts(),
  };

  return results;
}
