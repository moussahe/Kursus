// Adaptive Learning State API
// GET: Retrieve adaptive state for a child/subject
// POST: Update adaptive state after quiz session

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { Subject, GradeLevel } from "@prisma/client";

// Schema for GET request
const getStateSchema = z.object({
  childId: z.string().cuid(),
  subject: z.string(),
  gradeLevel: z.string(),
});

// Schema for POST request (update state)
const updateStateSchema = z.object({
  childId: z.string().cuid(),
  subject: z.string(),
  gradeLevel: z.string(),
  answers: z.array(
    z.object({
      difficulty: z.enum(["easy", "medium", "hard"]),
      correct: z.boolean(),
    }),
  ),
  finalDifficulty: z.enum(["easy", "medium", "hard"]),
  consecutiveCorrect: z.number().min(0),
  consecutiveWrong: z.number().min(0),
});

// Types for difficulty breakdown (use index signatures for Prisma JSON compatibility)
interface DifficultyStats {
  [key: string]: number;
  total: number;
  correct: number;
}

interface DifficultyBreakdown {
  [key: string]: DifficultyStats;
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
}

interface HistoryEntry {
  [key: string]: string | boolean;
  difficulty: "easy" | "medium" | "hard";
  correct: boolean;
  timestamp: string;
}

// Calculate mastery level based on performance
function calculateMasteryLevel(
  totalCorrect: number,
  totalQuestions: number,
  difficultyBreakdown: DifficultyBreakdown,
  currentStreak: number,
): number {
  if (totalQuestions === 0) return 0;

  // Base accuracy (0-50 points)
  const accuracy = totalCorrect / totalQuestions;
  const baseScore = accuracy * 50;

  // Difficulty bonus (0-30 points)
  // More points for harder questions
  let difficultyBonus = 0;
  const hardCorrect = difficultyBreakdown.hard.correct;
  const hardTotal = difficultyBreakdown.hard.total;
  const mediumCorrect = difficultyBreakdown.medium.correct;
  const mediumTotal = difficultyBreakdown.medium.total;

  if (hardTotal > 0) {
    difficultyBonus += (hardCorrect / hardTotal) * 20;
  }
  if (mediumTotal > 0) {
    difficultyBonus += (mediumCorrect / mediumTotal) * 10;
  }

  // Streak bonus (0-20 points)
  const streakBonus = Math.min(currentStreak * 2, 20);

  return Math.round(baseScore + difficultyBonus + streakBonus);
}

// GET - Retrieve adaptive learning state
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const url = new URL(req.url);
    const params = {
      childId: url.searchParams.get("childId"),
      subject: url.searchParams.get("subject"),
      gradeLevel: url.searchParams.get("gradeLevel"),
    };

    const validated = getStateSchema.parse(params);

    // Verify child belongs to parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Get or create adaptive learning state
    const state = await prisma.adaptiveLearningState.findUnique({
      where: {
        childId_subject_gradeLevel: {
          childId: validated.childId,
          subject: validated.subject as Subject,
          gradeLevel: validated.gradeLevel as GradeLevel,
        },
      },
    });

    // If no state exists, return default
    if (!state) {
      return NextResponse.json({
        exists: false,
        state: {
          currentDifficulty: "medium",
          consecutiveCorrect: 0,
          consecutiveWrong: 0,
          totalQuestionsAnswered: 0,
          totalCorrect: 0,
          totalWrong: 0,
          difficultyBreakdown: {
            easy: { total: 0, correct: 0 },
            medium: { total: 0, correct: 0 },
            hard: { total: 0, correct: 0 },
          },
          currentStreak: 0,
          bestStreak: 0,
          recentHistory: [],
          masteryLevel: 0,
          totalSessions: 0,
        },
      });
    }

    return NextResponse.json({
      exists: true,
      state: {
        currentDifficulty: state.currentDifficulty,
        consecutiveCorrect: state.consecutiveCorrect,
        consecutiveWrong: state.consecutiveWrong,
        totalQuestionsAnswered: state.totalQuestionsAnswered,
        totalCorrect: state.totalCorrect,
        totalWrong: state.totalWrong,
        difficultyBreakdown:
          state.difficultyBreakdown as unknown as DifficultyBreakdown,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        recentHistory: state.recentHistory as unknown as HistoryEntry[],
        masteryLevel: state.masteryLevel,
        totalSessions: state.totalSessions,
        lastSessionAt: state.lastSessionAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Get adaptive state error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Update adaptive learning state after quiz session
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateStateSchema.parse(body);

    // Verify child belongs to parent
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Get existing state or prepare defaults
    const existingState = await prisma.adaptiveLearningState.findUnique({
      where: {
        childId_subject_gradeLevel: {
          childId: validated.childId,
          subject: validated.subject as Subject,
          gradeLevel: validated.gradeLevel as GradeLevel,
        },
      },
    });

    // Parse existing data
    const existingBreakdown =
      (existingState?.difficultyBreakdown as unknown as DifficultyBreakdown) || {
        easy: { total: 0, correct: 0 },
        medium: { total: 0, correct: 0 },
        hard: { total: 0, correct: 0 },
      };
    const existingHistory =
      (existingState?.recentHistory as unknown as HistoryEntry[]) || [];

    // Calculate new stats from this session's answers
    const sessionCorrect = validated.answers.filter((a) => a.correct).length;
    const sessionWrong = validated.answers.filter((a) => !a.correct).length;

    // Update difficulty breakdown
    const newBreakdown = { ...existingBreakdown };
    for (const answer of validated.answers) {
      newBreakdown[answer.difficulty].total++;
      if (answer.correct) {
        newBreakdown[answer.difficulty].correct++;
      }
    }

    // Update recent history (keep last 50)
    const now = new Date().toISOString();
    const newHistoryEntries: HistoryEntry[] = validated.answers.map((a) => ({
      difficulty: a.difficulty,
      correct: a.correct,
      timestamp: now,
    }));
    const newHistory = [...existingHistory, ...newHistoryEntries].slice(-50);

    // Calculate new streak
    let newCurrentStreak = existingState?.currentStreak || 0;
    for (const answer of validated.answers) {
      if (answer.correct) {
        newCurrentStreak++;
      } else {
        newCurrentStreak = 0;
      }
    }

    // Calculate best streak
    const newBestStreak = Math.max(
      existingState?.bestStreak || 0,
      newCurrentStreak,
    );

    // Calculate totals
    const newTotalQuestions =
      (existingState?.totalQuestionsAnswered || 0) + validated.answers.length;
    const newTotalCorrect = (existingState?.totalCorrect || 0) + sessionCorrect;
    const newTotalWrong = (existingState?.totalWrong || 0) + sessionWrong;

    // Calculate mastery level
    const masteryLevel = calculateMasteryLevel(
      newTotalCorrect,
      newTotalQuestions,
      newBreakdown,
      newCurrentStreak,
    );

    // Upsert the state
    const updatedState = await prisma.adaptiveLearningState.upsert({
      where: {
        childId_subject_gradeLevel: {
          childId: validated.childId,
          subject: validated.subject as Subject,
          gradeLevel: validated.gradeLevel as GradeLevel,
        },
      },
      create: {
        childId: validated.childId,
        subject: validated.subject as Subject,
        gradeLevel: validated.gradeLevel as GradeLevel,
        currentDifficulty: validated.finalDifficulty,
        consecutiveCorrect: validated.consecutiveCorrect,
        consecutiveWrong: validated.consecutiveWrong,
        totalQuestionsAnswered: validated.answers.length,
        totalCorrect: sessionCorrect,
        totalWrong: sessionWrong,
        difficultyBreakdown: newBreakdown,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        recentHistory: newHistoryEntries,
        masteryLevel,
        totalSessions: 1,
        lastSessionAt: new Date(),
        lastMasteryUpdate: new Date(),
      },
      update: {
        currentDifficulty: validated.finalDifficulty,
        consecutiveCorrect: validated.consecutiveCorrect,
        consecutiveWrong: validated.consecutiveWrong,
        totalQuestionsAnswered: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        totalWrong: newTotalWrong,
        difficultyBreakdown: newBreakdown,
        currentStreak: newCurrentStreak,
        bestStreak: newBestStreak,
        recentHistory: newHistory,
        masteryLevel,
        totalSessions: { increment: 1 },
        lastSessionAt: new Date(),
        lastMasteryUpdate: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      state: {
        currentDifficulty: updatedState.currentDifficulty,
        masteryLevel: updatedState.masteryLevel,
        totalSessions: updatedState.totalSessions,
        currentStreak: updatedState.currentStreak,
        bestStreak: updatedState.bestStreak,
        accuracy:
          newTotalQuestions > 0
            ? Math.round((newTotalCorrect / newTotalQuestions) * 100)
            : 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }
    console.error("Update adaptive state error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
