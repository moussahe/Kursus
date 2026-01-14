// Real-time Adaptive Quiz - Single Question Generation
// POST /api/quizzes/adaptive/next-question
// Generates one question at a time, adapting difficulty based on performance

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateSingleAdaptiveQuestion, type Difficulty } from "@/lib/ai-quiz";

const requestSchema = z.object({
  lessonId: z.string().cuid(),
  childId: z.string().cuid(),
  currentDifficulty: z.enum(["easy", "medium", "hard"]),
  // Performance tracking for real-time adaptation
  sessionPerformance: z.object({
    totalAnswered: z.number().min(0),
    correctCount: z.number().min(0),
    consecutiveCorrect: z.number().min(0),
    consecutiveWrong: z.number().min(0),
    answeredQuestions: z.array(z.string()).default([]), // To avoid duplicates
    difficultyHistory: z.array(z.enum(["easy", "medium", "hard"])).default([]),
  }),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // 2. Validation
    const body = await req.json();
    const validated = requestSchema.parse(body);

    // 3. Verify child belongs to parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // 4. Get lesson with course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: validated.lessonId },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                subject: true,
                gradeLevel: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lecon non trouvee" }, { status: 404 });
    }

    // 5. Calculate optimal difficulty based on real-time performance
    const { sessionPerformance } = validated;
    const nextDifficulty = calculateRealTimeDifficulty(
      validated.currentDifficulty as Difficulty,
      sessionPerformance.consecutiveCorrect,
      sessionPerformance.consecutiveWrong,
      sessionPerformance.totalAnswered,
      sessionPerformance.correctCount,
    );

    // Track if difficulty changed
    const difficultyChanged = nextDifficulty !== validated.currentDifficulty;
    const previousDifficulty = validated.currentDifficulty as Difficulty;

    // 6. Fetch weak areas for targeting
    const weakAreas = await prisma.weakArea.findMany({
      where: {
        childId: validated.childId,
        subject: lesson.chapter.course.subject,
        isResolved: false,
      },
      orderBy: [{ errorCount: "desc" }, { lastErrorAt: "desc" }],
      take: 3,
    });

    const weakAreaTopics = weakAreas.map((wa) => wa.topic);

    // 7. Generate single question with AI
    const question = await generateSingleAdaptiveQuestion({
      subject: lesson.chapter.course.subject,
      gradeLevel: lesson.chapter.course.gradeLevel,
      lessonTitle: lesson.title,
      lessonContent: lesson.content || lesson.description || "",
      currentDifficulty: nextDifficulty,
      weakAreas: weakAreaTopics,
      previousQuestions: sessionPerformance.answeredQuestions,
      questionNumber: sessionPerformance.totalAnswered + 1,
    });

    // 8. Return question with adaptation info
    return NextResponse.json({
      success: true,
      question,
      adaptation: {
        previousDifficulty,
        currentDifficulty: nextDifficulty,
        difficultyChanged,
        reason: difficultyChanged
          ? getDifficultyChangeReason(
              previousDifficulty,
              nextDifficulty,
              sessionPerformance.consecutiveCorrect,
              sessionPerformance.consecutiveWrong,
            )
          : null,
      },
      context: {
        subject: lesson.chapter.course.subject,
        lessonTitle: lesson.title,
        gradeLevel: lesson.chapter.course.gradeLevel,
        questionNumber: sessionPerformance.totalAnswered + 1,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Real-time adaptive quiz error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Real-time difficulty calculation
function calculateRealTimeDifficulty(
  currentDifficulty: Difficulty,
  consecutiveCorrect: number,
  consecutiveWrong: number,
  totalAnswered: number,
  correctCount: number,
): Difficulty {
  // Early questions: use consecutive streak for quick adaptation
  if (totalAnswered < 3) {
    // Fast upward adaptation: 2 consecutive correct = level up
    if (consecutiveCorrect >= 2) {
      if (currentDifficulty === "easy") return "medium";
      if (currentDifficulty === "medium") return "hard";
    }
    // Fast downward adaptation: 2 consecutive wrong = level down
    if (consecutiveWrong >= 2) {
      if (currentDifficulty === "hard") return "medium";
      if (currentDifficulty === "medium") return "easy";
    }
    return currentDifficulty;
  }

  // After 3 questions: also consider overall performance
  const correctRate = correctCount / totalAnswered;

  // Strong performer: consecutive success + good overall rate
  if (consecutiveCorrect >= 2 && correctRate >= 0.7) {
    if (currentDifficulty === "easy") return "medium";
    if (currentDifficulty === "medium") return "hard";
  }

  // Struggling: consecutive failures OR very low rate
  if (consecutiveWrong >= 2 || (totalAnswered >= 3 && correctRate < 0.4)) {
    if (currentDifficulty === "hard") return "medium";
    if (currentDifficulty === "medium") return "easy";
  }

  // Single failure after streak: consider step down if hard
  if (
    consecutiveWrong >= 1 &&
    correctRate < 0.5 &&
    currentDifficulty === "hard"
  ) {
    return "medium";
  }

  return currentDifficulty;
}

// Generate human-readable reason for difficulty change
function getDifficultyChangeReason(
  previousDifficulty: Difficulty,
  newDifficulty: Difficulty,
  consecutiveCorrect: number,
  consecutiveWrong: number,
): string {
  const isLevelUp =
    (previousDifficulty === "easy" && newDifficulty === "medium") ||
    (previousDifficulty === "medium" && newDifficulty === "hard");

  if (isLevelUp) {
    if (consecutiveCorrect >= 2) {
      return `${consecutiveCorrect} reponses correctes d'affilee! Tu montes de niveau.`;
    }
    return "Excellente performance! Passons a un niveau superieur.";
  }

  // Level down
  if (consecutiveWrong >= 2) {
    return "Pas de souci, revoyons les bases ensemble.";
  }
  return "Ajustons la difficulte pour mieux t'accompagner.";
}
