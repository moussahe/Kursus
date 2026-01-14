import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateChallengeProgress } from "@/lib/daily-challenges";
import { z } from "zod";

const progressSchema = z.object({
  childId: z.string().cuid(),
  actionType: z.enum([
    "lesson_completed",
    "quiz_completed",
    "quiz_perfect",
    "ai_question",
    "time_spent",
    "review_completed",
  ]),
  value: z.number().min(1).optional().default(1),
  quizScore: z.number().min(0).max(100).optional(),
});

// POST /api/daily-challenges/progress - Update challenge progress
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = progressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { childId, actionType, value, quizScore } = parsed.data;

    // Verify the child belongs to the parent
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
      select: { id: true },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    const result = await updateChallengeProgress(
      childId,
      actionType,
      value,
      quizScore,
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Daily challenges progress error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
