// API Route: Generate AI Exercises
// POST /api/exercises/generate

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateExercises, EXERCISE_AI_MODEL } from "@/lib/ai-exercises";
import type { Difficulty, ExerciseType } from "@/types/exercise";

const generateSchema = z.object({
  lessonId: z.string().cuid(),
  childId: z.string().cuid(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  exerciseTypes: z
    .array(
      z.enum([
        "FILL_IN_BLANK",
        "MATCHING",
        "ORDERING",
        "SHORT_ANSWER",
        "TRUE_FALSE",
        "CALCULATION",
      ]),
    )
    .optional(),
  count: z.number().min(1).max(5).default(3),
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
    const validated = generateSchema.parse(body);

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

    // 4. Get lesson with course info for context
    const lesson = await prisma.lesson.findUnique({
      where: { id: validated.lessonId },
      include: {
        chapter: {
          include: {
            course: {
              select: {
                subject: true,
                gradeLevel: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lecon non trouvee" }, { status: 404 });
    }

    // 5. Get child's previous performance on this lesson
    const previousAttempts = await prisma.exerciseAttempt.findMany({
      where: {
        childId: validated.childId,
        exercise: {
          lessonId: validated.lessonId,
        },
      },
      include: {
        exercise: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Calculate performance stats
    let previousPerformance:
      | {
          correctRate: number;
          weakAreas: string[];
          preferredTypes: ExerciseType[];
        }
      | undefined;
    if (previousAttempts.length > 0) {
      const correctCount = previousAttempts.filter(
        (a: { isCorrect: boolean }) => a.isCorrect,
      ).length;
      const correctRate = correctCount / previousAttempts.length;

      // Determine weak areas based on incorrect answers
      const incorrectTypes = previousAttempts
        .filter((a: { isCorrect: boolean }) => !a.isCorrect)
        .map((a: { exercise: { type: string } }) => a.exercise.type);

      // Count preferred types (ones they got right)
      const correctTypes = previousAttempts
        .filter((a: { isCorrect: boolean }) => a.isCorrect)
        .map((a: { exercise: { type: string } }) => a.exercise.type);

      previousPerformance = {
        correctRate,
        weakAreas: [...new Set(incorrectTypes)] as string[],
        preferredTypes: [...new Set(correctTypes)] as ExerciseType[],
      };
    }

    // 6. Generate exercises using AI
    const generatedExercises = await generateExercises({
      subject: lesson.chapter.course.subject,
      gradeLevel: child.gradeLevel,
      lessonTitle: lesson.title,
      lessonContent: lesson.content || "",
      difficulty: validated.difficulty as Difficulty,
      exerciseTypes: validated.exerciseTypes as ExerciseType[] | undefined,
      previousPerformance,
    });

    // 7. Store exercises in database
    const savedExercises = await Promise.all(
      generatedExercises.slice(0, validated.count).map((exercise) =>
        prisma.exercise.create({
          data: {
            lessonId: validated.lessonId,
            childId: validated.childId,
            type: exercise.type,
            difficulty: exercise.difficulty,
            content: exercise.content as unknown as object,
            solution: exercise.solution as unknown as object,
            aiModel: EXERCISE_AI_MODEL,
          },
        }),
      ),
    );

    // 8. Return exercises with IDs
    const exercisesWithIds = savedExercises.map((saved, index) => ({
      id: saved.id,
      ...generatedExercises[index],
    }));

    return NextResponse.json({
      exercises: exercisesWithIds,
      lessonTitle: lesson.title,
      difficulty: validated.difficulty,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Error generating exercises:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
