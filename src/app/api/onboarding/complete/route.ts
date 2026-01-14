import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const onboardingSchema = z.object({
  childId: z.string().cuid(),
  subjects: z.array(z.string()),
  goals: z.array(z.string()),
  weeklyTime: z.number().min(1).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const validated = onboardingSchema.parse(body);

    // Verify the child belongs to this parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Mark onboarding as completed
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompletedAt: new Date(),
      },
    });

    // Create initial study goals based on the weekly time commitment
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Sunday
    weekEnd.setHours(23, 59, 59, 999);

    // Create a weekly lessons goal based on time commitment
    // Assuming ~20min per lesson, calculate expected lessons
    const expectedLessons = Math.ceil((validated.weeklyTime * 60) / 20);

    // Check if a similar goal already exists
    const existingGoal = await prisma.studyGoal.findFirst({
      where: {
        childId: validated.childId,
        type: "LESSONS_COMPLETED",
        period: "WEEKLY",
        periodStart: weekStart,
      },
    });

    if (existingGoal) {
      await prisma.studyGoal.update({
        where: { id: existingGoal.id },
        data: { target: expectedLessons },
      });
    } else {
      await prisma.studyGoal.create({
        data: {
          childId: validated.childId,
          createdById: session.user.id,
          type: "LESSONS_COMPLETED",
          period: "WEEKLY",
          target: expectedLessons,
          periodStart: weekStart,
          periodEnd: weekEnd,
          xpReward: 100,
        },
      });
    }

    // Create an alert to welcome the parent
    await prisma.alert.create({
      data: {
        parentId: session.user.id,
        childId: validated.childId,
        type: "AI_INSIGHT",
        priority: "LOW",
        title: `Bienvenue ! Le profil de ${child.firstName} est pret`,
        message: `Nous avons configure le profil de ${child.firstName} avec ${validated.subjects.length} matiere(s) prioritaire(s). Objectif: ${validated.weeklyTime}h d'etude par semaine. Explorez les cours recommandes pour commencer !`,
        actionUrl: "/parent",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding complete",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Donnees invalides", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
