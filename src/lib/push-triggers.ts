import {
  sendPushToParent,
  NotificationTemplates,
} from "@/lib/push-notifications";
import { prisma } from "@/lib/prisma";
import type { PushNotificationType } from "@prisma/client";

/**
 * Trigger push notification for quiz completion
 */
export async function triggerQuizCompleted(
  childId: string,
  quizTitle: string,
  score: number,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    // Determine notification type based on score
    const type: PushNotificationType =
      score >= 90
        ? "HIGH_QUIZ_SCORE"
        : score < 50
          ? "LOW_QUIZ_SCORE"
          : "QUIZ_COMPLETED";

    const template =
      type === "HIGH_QUIZ_SCORE"
        ? NotificationTemplates.highQuizScore(child.firstName, quizTitle, score)
        : type === "LOW_QUIZ_SCORE"
          ? NotificationTemplates.lowQuizScore(
              child.firstName,
              quizTitle,
              score,
            )
          : NotificationTemplates.quizCompleted(
              child.firstName,
              quizTitle,
              score,
            );

    await sendPushToParent(childId, type, template, {
      quizTitle,
      score,
    });
  } catch (error) {
    console.error("Failed to trigger quiz completed push:", error);
  }
}

/**
 * Trigger push notification for lesson completion
 */
export async function triggerLessonCompleted(
  childId: string,
  lessonTitle: string,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.lessonCompleted(
      child.firstName,
      lessonTitle,
    );

    await sendPushToParent(childId, "LESSON_COMPLETED", template, {
      lessonTitle,
    });
  } catch (error) {
    console.error("Failed to trigger lesson completed push:", error);
  }
}

/**
 * Trigger push notification for course completion
 */
export async function triggerCourseCompleted(
  childId: string,
  courseTitle: string,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.courseCompleted(
      child.firstName,
      courseTitle,
    );

    await sendPushToParent(childId, "COURSE_COMPLETED", template, {
      courseTitle,
    });
  } catch (error) {
    console.error("Failed to trigger course completed push:", error);
  }
}

/**
 * Trigger push notification for milestone reached
 */
export async function triggerMilestoneReached(
  childId: string,
  milestone: string,
  xp: number,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.milestoneReached(
      child.firstName,
      milestone,
      xp,
    );

    await sendPushToParent(childId, "MILESTONE_REACHED", template, {
      milestone,
      xp,
    });
  } catch (error) {
    console.error("Failed to trigger milestone reached push:", error);
  }
}

/**
 * Trigger push notification for streak achieved
 */
export async function triggerStreakAchieved(
  childId: string,
  streakDays: number,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.streakAchieved(
      child.firstName,
      streakDays,
    );

    await sendPushToParent(childId, "STREAK_ACHIEVED", template, {
      streakDays,
    });
  } catch (error) {
    console.error("Failed to trigger streak achieved push:", error);
  }
}

/**
 * Trigger push notification for new badge earned
 */
export async function triggerBadgeEarned(
  childId: string,
  badgeName: string,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.newBadgeEarned(
      child.firstName,
      badgeName,
    );

    await sendPushToParent(childId, "NEW_BADGE_EARNED", template, {
      badgeName,
    });
  } catch (error) {
    console.error("Failed to trigger badge earned push:", error);
  }
}

/**
 * Trigger push notification for weekly report ready
 */
export async function triggerWeeklyReportReady(childId: string): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.weeklyReportReady(child.firstName);

    await sendPushToParent(childId, "WEEKLY_REPORT_READY", template);
  } catch (error) {
    console.error("Failed to trigger weekly report ready push:", error);
  }
}

/**
 * Trigger push notification for inactivity reminder
 * This should be called by a cron job
 */
export async function triggerInactivityReminder(
  childId: string,
  daysSinceActivity: number,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.inactivityReminder(
      child.firstName,
      daysSinceActivity,
    );

    await sendPushToParent(childId, "INACTIVITY_REMINDER", template, {
      daysSinceActivity,
    });
  } catch (error) {
    console.error("Failed to trigger inactivity reminder push:", error);
  }
}

/**
 * Trigger push notification for revision due
 */
export async function triggerRevisionDue(
  childId: string,
  topicCount: number,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.revisionDue(
      child.firstName,
      topicCount,
    );

    await sendPushToParent(childId, "REVISION_DUE", template, {
      topicCount,
    });
  } catch (error) {
    console.error("Failed to trigger revision due push:", error);
  }
}

/**
 * Trigger push notification for goal completed
 */
export async function triggerGoalCompleted(
  childId: string,
  goalDescription: string,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.goalCompleted(
      child.firstName,
      goalDescription,
    );

    await sendPushToParent(childId, "GOAL_COMPLETED", template, {
      goalDescription,
    });
  } catch (error) {
    console.error("Failed to trigger goal completed push:", error);
  }
}

/**
 * Trigger push notification for goal reminder
 */
export async function triggerGoalReminder(
  childId: string,
  goalDescription: string,
  daysLeft: number,
): Promise<void> {
  try {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      select: { firstName: true },
    });

    if (!child) return;

    const template = NotificationTemplates.goalReminder(
      child.firstName,
      goalDescription,
      daysLeft,
    );

    await sendPushToParent(childId, "GOAL_REMINDER", template, {
      goalDescription,
      daysLeft,
    });
  } catch (error) {
    console.error("Failed to trigger goal reminder push:", error);
  }
}

/**
 * Check for children who need inactivity reminders
 * Run this daily via cron
 */
export async function checkAndSendInactivityReminders(): Promise<number> {
  const INACTIVITY_THRESHOLD_DAYS = 3;

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - INACTIVITY_THRESHOLD_DAYS);

  // Find children inactive for threshold days
  const inactiveChildren = await prisma.child.findMany({
    where: {
      OR: [{ lastActivityAt: { lt: thresholdDate } }, { lastActivityAt: null }],
    },
    select: { id: true, lastActivityAt: true },
  });

  let sentCount = 0;

  for (const child of inactiveChildren) {
    const daysSince = child.lastActivityAt
      ? Math.floor(
          (Date.now() - child.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : INACTIVITY_THRESHOLD_DAYS;

    // Only send once every 3 days to avoid spam
    if (daysSince % 3 === 0) {
      await triggerInactivityReminder(child.id, daysSince);
      sentCount++;
    }
  }

  return sentCount;
}

/**
 * Check for children with revision due
 * Run this daily via cron
 */
export async function checkAndSendRevisionReminders(): Promise<number> {
  const now = new Date();

  // Find children with cards due for review
  const childrenWithDueCards = await prisma.spacedRepetitionCard.groupBy({
    by: ["childId"],
    where: {
      isActive: true,
      isMastered: false,
      nextReviewAt: { lte: now },
    },
    _count: { id: true },
  });

  let sentCount = 0;

  for (const group of childrenWithDueCards) {
    await triggerRevisionDue(group.childId, group._count.id);
    sentCount++;
  }

  return sentCount;
}
