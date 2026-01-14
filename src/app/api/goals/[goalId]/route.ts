import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateGoalSchema = z.object({
  target: z.number().min(1).optional(),
  xpReward: z.number().min(0).max(500).optional(),
  isActive: z.boolean().optional(),
});

// GET - Get a single goal
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { goalId } = await params;

    const goal = await prisma.studyGoal.findFirst({
      where: {
        id: goalId,
        child: {
          parentId: session.user.id,
        },
      },
      include: {
        child: {
          select: {
            firstName: true,
            gradeLevel: true,
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Objectif non trouve" },
        { status: 404 },
      );
    }

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("GET /api/goals/[goalId] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PATCH - Update a goal
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { goalId } = await params;
    const body = await req.json();
    const validated = updateGoalSchema.parse(body);

    // Verify ownership
    const existingGoal = await prisma.studyGoal.findFirst({
      where: {
        id: goalId,
        child: {
          parentId: session.user.id,
        },
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Objectif non trouve" },
        { status: 404 },
      );
    }

    const goal = await prisma.studyGoal.update({
      where: { id: goalId },
      data: validated,
    });

    return NextResponse.json({ goal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("PATCH /api/goals/[goalId] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Delete a goal
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { goalId } = await params;

    // Verify ownership
    const existingGoal = await prisma.studyGoal.findFirst({
      where: {
        id: goalId,
        child: {
          parentId: session.user.id,
        },
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Objectif non trouve" },
        { status: 404 },
      );
    }

    await prisma.studyGoal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/goals/[goalId] error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
