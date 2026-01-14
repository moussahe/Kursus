import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { GoalType, GoalPeriod, Subject } from "@prisma/client";

// Schema for creating a goal
const createGoalSchema = z.object({
  childId: z.string().cuid(),
  type: z.nativeEnum(GoalType),
  period: z.nativeEnum(GoalPeriod).default(GoalPeriod.WEEKLY),
  target: z.number().min(1),
  courseId: z.string().cuid().optional(),
  subject: z.nativeEnum(Subject).optional(),
  xpReward: z.number().min(0).max(500).default(50),
});

// Helper to calculate period dates
function getPeriodDates(period: GoalPeriod): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  switch (period) {
    case GoalPeriod.DAILY:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case GoalPeriod.WEEKLY:
      // Start from Monday
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(now.getDate() - daysToMonday);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case GoalPeriod.MONTHLY:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

// GET - Fetch goals for a child
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const childId = searchParams.get("childId");
    const activeOnly = searchParams.get("activeOnly") !== "false";

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

    const goals = await prisma.studyGoal.findMany({
      where: {
        childId,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [{ isCompleted: "asc" }, { periodEnd: "asc" }],
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Create a new goal
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createGoalSchema.parse(body);

    // Verify parent owns this child
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Check for duplicate active goal of same type
    const existingGoal = await prisma.studyGoal.findFirst({
      where: {
        childId: validated.childId,
        type: validated.type,
        period: validated.period,
        isActive: true,
        isCompleted: false,
      },
    });

    if (existingGoal) {
      return NextResponse.json(
        { error: "Un objectif similaire est deja actif" },
        { status: 409 },
      );
    }

    const { start, end } = getPeriodDates(validated.period);

    const goal = await prisma.studyGoal.create({
      data: {
        childId: validated.childId,
        createdById: session.user.id,
        type: validated.type,
        period: validated.period,
        target: validated.target,
        courseId: validated.courseId,
        subject: validated.subject,
        xpReward: validated.xpReward,
        periodStart: start,
        periodEnd: end,
      },
    });

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("POST /api/goals error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
