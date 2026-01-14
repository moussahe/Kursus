import webPush from "web-push";
import { prisma } from "@/lib/prisma";
import type { PushNotificationType } from "@prisma/client";

// Configure web-push with VAPID keys
// Generate keys with: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:contact@schoolaris.fr";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  url?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  renotify?: boolean;
  data?: Record<string, unknown>;
}

export interface SendPushOptions {
  userId: string;
  childId?: string;
  type: PushNotificationType;
  payload: PushNotificationPayload;
  metadata?: Record<string, unknown>;
}

// Notification type to preference field mapping
const NOTIFICATION_TYPE_TO_PREFERENCE: Record<PushNotificationType, string> = {
  QUIZ_COMPLETED: "quizCompleted",
  LESSON_COMPLETED: "lessonCompleted",
  COURSE_COMPLETED: "courseCompleted",
  MILESTONE_REACHED: "milestoneReached",
  STREAK_ACHIEVED: "streakAchieved",
  INACTIVITY_REMINDER: "inactivityReminder",
  WEEKLY_REPORT_READY: "weeklyReportReady",
  NEW_BADGE_EARNED: "newBadgeEarned",
  REVISION_DUE: "revisionDue",
  GOAL_COMPLETED: "goalCompleted",
  GOAL_REMINDER: "goalReminder",
  LOW_QUIZ_SCORE: "lowQuizScore",
  HIGH_QUIZ_SCORE: "highQuizScore",
};

/**
 * Check if a notification type is enabled for a user
 */
async function isNotificationEnabled(
  userId: string,
  type: PushNotificationType,
): Promise<boolean> {
  const preferences = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  // If no preferences exist, default to enabled
  if (!preferences) return true;

  // Check master toggle
  if (!preferences.pushEnabled) return false;

  // Check specific type
  const preferenceField = NOTIFICATION_TYPE_TO_PREFERENCE[type];
  const typeEnabled = (preferences as Record<string, unknown>)[preferenceField];

  return typeEnabled !== false;
}

/**
 * Check if we're in quiet hours for the user
 */
async function isQuietHours(userId: string): Promise<boolean> {
  const preferences = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  if (!preferences?.quietHoursEnabled) return false;

  const now = new Date();
  const userTimezone = preferences.timezone || "Europe/Paris";

  // Get current time in user's timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const currentTime = formatter.format(now);
  const [hours, minutes] = currentTime.split(":").map(Number);
  const currentMinutes = hours * 60 + minutes;

  const [startHours, startMinutes] = preferences.quietHoursStart
    .split(":")
    .map(Number);
  const [endHours, endMinutes] = preferences.quietHoursEnd
    .split(":")
    .map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // Handle overnight quiet hours (e.g., 21:00 to 08:00)
  if (startTotalMinutes > endTotalMinutes) {
    return (
      currentMinutes >= startTotalMinutes || currentMinutes < endTotalMinutes
    );
  }

  return (
    currentMinutes >= startTotalMinutes && currentMinutes < endTotalMinutes
  );
}

/**
 * Send push notification to a user
 */
export async function sendPushNotification(options: SendPushOptions): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  logId?: string;
}> {
  const { userId, childId, type, payload, metadata } = options;

  // Check if notification type is enabled
  const isEnabled = await isNotificationEnabled(userId, type);
  if (!isEnabled) {
    return { success: false, sent: 0, failed: 0 };
  }

  // Check quiet hours
  const inQuietHours = await isQuietHours(userId);
  if (inQuietHours) {
    // TODO: Queue for later delivery
    return { success: false, sent: 0, failed: 0 };
  }

  // Get active subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: {
      userId,
      isActive: true,
      ...(childId ? { OR: [{ childId }, { childId: null }] } : {}),
    },
  });

  if (subscriptions.length === 0) {
    return { success: false, sent: 0, failed: 0 };
  }

  // Create log entry
  const log = await prisma.pushNotificationLog.create({
    data: {
      userId,
      childId,
      type,
      title: payload.title,
      body: payload.body,
      url: payload.url,
      imageUrl: payload.image,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      status: "pending",
    },
  });

  // Prepare notification payload
  const notificationPayload = JSON.stringify({
    ...payload,
    notificationId: log.id,
    type,
    childId,
  });

  let sent = 0;
  let failed = 0;

  // Send to all subscriptions
  for (const subscription of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        notificationPayload,
      );

      sent++;

      // Update subscription last used
      await prisma.pushSubscription.update({
        where: { id: subscription.id },
        data: { lastUsedAt: new Date(), failedCount: 0 },
      });
    } catch (error) {
      failed++;

      // Handle subscription errors
      if (error instanceof webPush.WebPushError) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          // Subscription is no longer valid, deactivate it
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { isActive: false },
          });
        } else {
          // Increment failed count
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { failedCount: { increment: 1 } },
          });
        }
      }

      console.error("Push notification failed:", error);
    }
  }

  // Update log status
  await prisma.pushNotificationLog.update({
    where: { id: log.id },
    data: {
      status: sent > 0 ? "sent" : "failed",
      sentAt: sent > 0 ? new Date() : null,
      failedAt: failed > 0 && sent === 0 ? new Date() : null,
      errorMessage:
        failed > 0 ? `Failed to deliver to ${failed} subscription(s)` : null,
    },
  });

  return { success: sent > 0, sent, failed, logId: log.id };
}

/**
 * Send push notification to all parents of a child
 */
export async function sendPushToParent(
  childId: string,
  type: PushNotificationType,
  payload: PushNotificationPayload,
  metadata?: Record<string, unknown>,
): Promise<{ success: boolean; sent: number; failed: number }> {
  const child = await prisma.child.findUnique({
    where: { id: childId },
    select: { parentId: true },
  });

  if (!child) {
    return { success: false, sent: 0, failed: 0 };
  }

  return sendPushNotification({
    userId: child.parentId,
    childId,
    type,
    payload,
    metadata,
  });
}

// ============ NOTIFICATION TEMPLATES ============

export const NotificationTemplates = {
  quizCompleted: (childName: string, quizTitle: string, score: number) => ({
    title: `${childName} a termine un quiz!`,
    body: `Score: ${score}% sur "${quizTitle}"`,
    icon: "/icons/icon-192x192.png",
    tag: "quiz-completed",
    url: "/parent",
    actions: [{ action: "view", title: "Voir les details" }],
  }),

  lessonCompleted: (childName: string, lessonTitle: string) => ({
    title: `${childName} a termine une lecon!`,
    body: `"${lessonTitle}" est maintenant complete`,
    icon: "/icons/icon-192x192.png",
    tag: "lesson-completed",
    url: "/parent",
  }),

  courseCompleted: (childName: string, courseTitle: string) => ({
    title: `Felicitations! Cours termine!`,
    body: `${childName} a termine le cours "${courseTitle}"`,
    icon: "/icons/icon-192x192.png",
    tag: "course-completed",
    url: "/parent",
    requireInteraction: true,
    actions: [{ action: "view", title: "Voir le certificat" }],
  }),

  milestoneReached: (childName: string, milestone: string, xp: number) => ({
    title: `${childName} a atteint un jalon!`,
    body: `${milestone} - ${xp} XP total`,
    icon: "/icons/icon-192x192.png",
    tag: "milestone",
    url: "/parent",
  }),

  streakAchieved: (childName: string, streakDays: number) => ({
    title: `Serie de ${streakDays} jours!`,
    body: `${childName} maintient sa serie d'etude`,
    icon: "/icons/icon-192x192.png",
    tag: "streak",
    url: "/parent",
  }),

  inactivityReminder: (childName: string, daysSinceActivity: number) => ({
    title: `${childName} n'a pas etudie depuis ${daysSinceActivity} jours`,
    body: "Encouragez-le a reprendre ses cours!",
    icon: "/icons/icon-192x192.png",
    tag: "inactivity",
    url: "/parent",
    requireInteraction: true,
    actions: [{ action: "view", title: "Voir le dashboard" }],
  }),

  weeklyReportReady: (childName: string) => ({
    title: `Rapport hebdomadaire disponible`,
    body: `Le rapport de ${childName} est pret`,
    icon: "/icons/icon-192x192.png",
    tag: "weekly-report",
    url: "/parent",
    actions: [{ action: "view", title: "Voir le rapport" }],
  }),

  newBadgeEarned: (childName: string, badgeName: string) => ({
    title: `Nouveau badge debloque!`,
    body: `${childName} a obtenu le badge "${badgeName}"`,
    icon: "/icons/icon-192x192.png",
    tag: "badge",
    url: "/parent",
  }),

  revisionDue: (childName: string, topicCount: number) => ({
    title: `Revision a faire`,
    body: `${childName} a ${topicCount} sujet(s) a reviser aujourd'hui`,
    icon: "/icons/icon-192x192.png",
    tag: "revision",
    url: "/parent",
    actions: [{ action: "view", title: "Commencer la revision" }],
  }),

  goalCompleted: (childName: string, goalDescription: string) => ({
    title: `Objectif atteint!`,
    body: `${childName} a atteint son objectif: ${goalDescription}`,
    icon: "/icons/icon-192x192.png",
    tag: "goal-completed",
    url: "/parent",
  }),

  goalReminder: (
    childName: string,
    goalDescription: string,
    daysLeft: number,
  ) => ({
    title: `Rappel d'objectif`,
    body: `${childName} - "${goalDescription}" expire dans ${daysLeft} jour(s)`,
    icon: "/icons/icon-192x192.png",
    tag: "goal-reminder",
    url: "/parent",
  }),

  lowQuizScore: (childName: string, quizTitle: string, score: number) => ({
    title: `${childName} a besoin d'aide`,
    body: `Score de ${score}% sur "${quizTitle}" - Un soutien serait benefique`,
    icon: "/icons/icon-192x192.png",
    tag: "low-score",
    url: "/parent",
    requireInteraction: true,
    actions: [{ action: "view", title: "Voir les details" }],
  }),

  highQuizScore: (childName: string, quizTitle: string, score: number) => ({
    title: `Excellent travail de ${childName}!`,
    body: `Score parfait de ${score}% sur "${quizTitle}"!`,
    icon: "/icons/icon-192x192.png",
    tag: "high-score",
    url: "/parent",
  }),
};

/**
 * Get VAPID public key for client-side subscription
 */
export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

/**
 * Deactivate subscriptions with too many failures
 */
export async function cleanupFailedSubscriptions(): Promise<number> {
  const MAX_FAILURES = 5;

  const result = await prisma.pushSubscription.updateMany({
    where: {
      failedCount: { gte: MAX_FAILURES },
      isActive: true,
    },
    data: { isActive: false },
  });

  return result.count;
}
