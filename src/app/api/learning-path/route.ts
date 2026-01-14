import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getActiveLearningPath,
  getLearningPathHistory,
  generateAndStoreLearningPath,
} from "@/lib/ai-learning-path";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const querySchema = z.object({
  childId: z.string().cuid(),
  includeHistory: z.coerce.boolean().optional().default(false),
  historyLimit: z.coerce.number().min(1).max(50).optional().default(10),
});

// GET /api/learning-path?childId=xxx - Get active learning path
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = querySchema.safeParse(searchParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametres invalides", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const validated = parsed.data;

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

    // Get active learning path
    const activePath = await getActiveLearningPath(validated.childId);

    // Optionally include history
    const history = validated.includeHistory
      ? await getLearningPathHistory(validated.childId, validated.historyLimit)
      : undefined;

    return NextResponse.json({
      active: activePath,
      history,
    });
  } catch (error) {
    console.error("[Learning Path] GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const generateSchema = z.object({
  childId: z.string().cuid(),
});

// POST /api/learning-path - Generate new learning path
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Rate limit: 10 learning path generations per hour
    const rateLimitResult = await checkRateLimit(
      session.user.id,
      "LEARNING_PATH",
    );
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Trop de requetes. Reessayez plus tard.",
          remaining: rateLimitResult.remaining,
          reset: rateLimitResult.reset,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = generateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametres invalides", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const validated = parsed.data;

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

    // Generate and store new learning path
    const learningPath = await generateAndStoreLearningPath(validated.childId);

    if (!learningPath) {
      return NextResponse.json(
        {
          error:
            "Impossible de generer le parcours. Verifiez que l'enfant a des cours actifs.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(learningPath, { status: 201 });
  } catch (error) {
    console.error("[Learning Path] POST error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
