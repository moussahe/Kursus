// API Route: Submit Exercise Answer
// POST /api/exercises/submit

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  evaluateExerciseAnswer,
  generateExerciseFeedback,
  calculateExerciseXP,
} from "@/lib/ai-exercises";
import { addXP, updateStreak, checkAndAwardBadges } from "@/lib/gamification";
import type { GeneratedExercise, ExerciseType } from "@/types/exercise";

const submitSchema = z.object({
  exerciseId: z.string().cuid(),
  childId: z.string().cuid(),
  answer: z.unknown(),
  timeSpent: z.number().min(0).default(0),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // 2. Validate request
    const body = await req.json();
    const validated = submitSchema.parse(body);

    // 3. Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // 4. Get the exercise
    const exercise = await prisma.exercise.findUnique({
      where: { id: validated.exerciseId },
      include: {
        lesson: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercice non trouve" },
        { status: 404 },
      );
    }

    // 5. Evaluate the answer
    const exerciseData: GeneratedExercise = {
      type: exercise.type as ExerciseType,
      difficulty: exercise.difficulty as "easy" | "medium" | "hard",
      content: exercise.content as unknown as GeneratedExercise["content"],
      solution: exercise.solution as unknown as GeneratedExercise["solution"],
      points:
        exercise.difficulty === "easy"
          ? 5
          : exercise.difficulty === "medium"
            ? 10
            : 15,
      estimatedTime: 60,
    };

    const evaluation = evaluateExerciseAnswer(exerciseData, validated.answer);

    // 6. Generate AI feedback
    const feedbackResult = await generateExerciseFeedback({
      childName: child.firstName,
      gradeLevel: child.gradeLevel,
      exerciseType: exercise.type as ExerciseType,
      question:
        (exercise.content as { question?: string })?.question || "Exercice",
      userAnswer: validated.answer,
      correctAnswer: exercise.solution,
      isCorrect: evaluation.isCorrect,
    });

    // 7. Calculate XP
    const xpEarned = evaluation.isCorrect
      ? calculateExerciseXP([{ isCorrect: true, score: evaluation.score }])
      : 0;

    // 8. Save the attempt
    const attempt = await prisma.exerciseAttempt.create({
      data: {
        exerciseId: validated.exerciseId,
        childId: validated.childId,
        answer: validated.answer as object,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        feedback: feedbackResult.feedback,
        timeSpent: validated.timeSpent,
        xpEarned,
      },
    });

    // 9. Award XP and update streak
    let xpResult = null;
    let streakResult = null;
    let newBadges: { code: string; name: string }[] = [];

    if (xpEarned > 0) {
      xpResult = await addXP(validated.childId, xpEarned, "Exercise completed");
      streakResult = await updateStreak(validated.childId);
      newBadges = await checkAndAwardBadges(validated.childId);
    }

    // 10. Return result
    return NextResponse.json({
      attemptId: attempt.id,
      isCorrect: evaluation.isCorrect,
      score: evaluation.score,
      maxScore: exerciseData.points,
      partialCredit: evaluation.partialCredit,
      feedback: feedbackResult.feedback,
      explanation: feedbackResult.explanation,
      solution: exercise.solution,
      xpEarned,
      gamification: xpResult
        ? {
            newXP: xpResult.newXP,
            newLevel: xpResult.newLevel,
            leveledUp: xpResult.leveledUp,
            currentStreak: streakResult?.currentStreak || 0,
            newBadges,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error submitting exercise:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
