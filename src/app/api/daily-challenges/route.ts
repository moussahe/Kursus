import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getTodayChallenges,
  getChallengeHistory,
} from "@/lib/daily-challenges";
import { z } from "zod";

const querySchema = z.object({
  childId: z.string().cuid(),
  history: z.coerce.boolean().optional().default(false),
  days: z.coerce.number().min(1).max(30).optional().default(7),
});

// GET /api/daily-challenges - Get today's challenges or history
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      childId: searchParams.get("childId"),
      history: searchParams.get("history"),
      days: searchParams.get("days"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametres invalides", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { childId, history, days } = parsed.data;

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

    if (history) {
      const result = await getChallengeHistory(childId, days);
      return NextResponse.json(result);
    }

    const result = await getTodayChallenges(childId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Daily challenges GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
