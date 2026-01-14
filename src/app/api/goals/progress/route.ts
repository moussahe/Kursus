import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoalType } from "@prisma/client";
import { awardXP } from "@/lib/gamification";

// Helper to calculate current value for a goal
async function calculateGoalProgress(
  childId: string,
  goal: {
    type: GoalType;
    periodStart: Date;
    periodEnd: Date;
    courseId: string | null;
    subject: string | null;
  },
): Promise<number> {
  const { type, periodStart, periodEnd, courseId, subject } = goal;

  switch (type) {
    case GoalType.LESSONS_COMPLETED: {
      const count = await prisma.progress.count({
        where: {
          childId,
          isCompleted: true,
          updatedAt: {
            gte: periodStart,
            lte: periodEnd,
          },
          ...(courseId ? { lesson: { chapter: { courseId } } } : {}),
          ...(subject
            ? { lesson: { chapter: { course: { subject: subject as never } } } }
            : {}),
        },
      });
      return count;
    }

    case GoalType.QUIZ_SCORE: {
      const attempts = await prisma.quizAttempt.findMany({
        where: {
          childId,
          completedAt: {
            gte: periodStart,
            lte: periodEnd,
          },
          ...(courseId ? { lesson: { chapter: { courseId } } } : {}),
        },
        select: { percentage: true },
      });
      if (attempts.length === 0) return 0;
      const avg =
        attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length;
      return Math.round(avg);
    }

    case GoalType.TIME_SPENT: {
      const result = await prisma.progress.aggregate({
        where: {
          childId,
          updatedAt: {
            gte: periodStart,
            lte: periodEnd,
          },
          ...(courseId ? { lesson: { chapter: { courseId } } } : {}),
        },
        _sum: { timeSpent: true },
      });
      // Convert seconds to minutes
      return Math.round((result._sum.timeSpent || 0) / 60);
    }

    case GoalType.STREAK_DAYS: {
      const child = await prisma.child.findUnique({
        where: { id: childId },
        select: { currentStreak: true },
      });
      return child?.currentStreak || 0;
    }

    case GoalType.COURSE_PROGRESS: {
      if (!courseId) return 0;
      const [totalLessons, completedLessons] = await Promise.all([
        prisma.lesson.count({
          where: {
            chapter: { courseId, isPublished: true },
            isPublished: true,
          },
        }),
        prisma.progress.count({
          where: {
            childId,
            isCompleted: true,
            lesson: { chapter: { courseId } },
          },
        }),
      ]);
      if (totalLessons === 0) return 0;
      return Math.round((completedLessons / totalLessons) * 100);
    }

    default:
      return 0;
  }
}

// POST - Update progress for all active goals of a child
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const { childId } = body;

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

    const now = new Date();

    // Get all active, non-completed goals that haven't expired
    const activeGoals = await prisma.studyGoal.findMany({
      where: {
        childId,
        isActive: true,
        isCompleted: false,
        periodEnd: { gte: now },
      },
    });

    const updatedGoals = [];
    const completedGoals = [];

    for (const goal of activeGoals) {
      const currentValue = await calculateGoalProgress(childId, goal);
      const isCompleted = currentValue >= goal.target;

      const updated = await prisma.studyGoal.update({
        where: { id: goal.id },
        data: {
          currentValue,
          isCompleted,
          completedAt:
            isCompleted && !goal.completedAt ? now : goal.completedAt,
        },
      });

      updatedGoals.push(updated);

      // Award XP if newly completed
      if (isCompleted && !goal.xpAwarded && goal.xpReward > 0) {
        await awardXP(childId, goal.xpReward, `Objectif atteint: ${goal.type}`);
        await prisma.studyGoal.update({
          where: { id: goal.id },
          data: { xpAwarded: true },
        });
        completedGoals.push({
          ...updated,
          xpAwarded: true,
        });
      }
    }

    return NextResponse.json({
      updated: updatedGoals.length,
      completed: completedGoals.length,
      goals: updatedGoals,
      completedGoals,
    });
  } catch (error) {
    console.error("POST /api/goals/progress error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
