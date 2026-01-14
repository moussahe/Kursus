import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const preferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  quizCompleted: z.boolean().optional(),
  lessonCompleted: z.boolean().optional(),
  courseCompleted: z.boolean().optional(),
  milestoneReached: z.boolean().optional(),
  streakAchieved: z.boolean().optional(),
  inactivityReminder: z.boolean().optional(),
  weeklyReportReady: z.boolean().optional(),
  newBadgeEarned: z.boolean().optional(),
  revisionDue: z.boolean().optional(),
  goalCompleted: z.boolean().optional(),
  goalReminder: z.boolean().optional(),
  lowQuizScore: z.boolean().optional(),
  highQuizScore: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Get or create preferences
    let preferences = await prisma.notificationPreferences.findUnique({
      where: { userId: session.user.id },
    });

    if (!preferences) {
      preferences = await prisma.notificationPreferences.create({
        data: { userId: session.user.id },
      });
    }

    // Get subscriptions count
    const subscriptionCount = await prisma.pushSubscription.count({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    return NextResponse.json({
      preferences,
      hasActiveSubscriptions: subscriptionCount > 0,
      subscriptionCount,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const validated = preferencesSchema.parse(body);

    const preferences = await prisma.notificationPreferences.upsert({
      where: { userId: session.user.id },
      update: validated,
      create: {
        userId: session.user.id,
        ...validated,
      },
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Update preferences error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
