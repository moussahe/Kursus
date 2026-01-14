"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Target,
  BookOpen,
  Brain,
  Clock,
  Flame,
  TrendingUp,
  CheckCircle2,
  Zap,
  ChevronRight,
} from "lucide-react";
import type { GoalType, GoalPeriod, Subject } from "@prisma/client";

interface StudyGoal {
  id: string;
  type: GoalType;
  period: GoalPeriod;
  target: number;
  currentValue: number;
  isCompleted: boolean;
  completedAt: string | null;
  periodStart: string;
  periodEnd: string;
  xpReward: number;
  xpAwarded: boolean;
  courseId: string | null;
  subject: Subject | null;
}

interface StudyGoalCardProps {
  childId: string;
  className?: string;
  compact?: boolean;
}

const goalTypeConfig: Record<
  GoalType,
  {
    icon: typeof Target;
    label: string;
    unit: string;
    color: string;
    bgColor: string;
  }
> = {
  LESSONS_COMPLETED: {
    icon: BookOpen,
    label: "Lecons",
    unit: "lecons",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  QUIZ_SCORE: {
    icon: Brain,
    label: "Score Quiz",
    unit: "%",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  TIME_SPENT: {
    icon: Clock,
    label: "Temps d'etude",
    unit: "min",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  STREAK_DAYS: {
    icon: Flame,
    label: "Serie",
    unit: "jours",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  COURSE_PROGRESS: {
    icon: TrendingUp,
    label: "Progression",
    unit: "%",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
};

const periodLabels: Record<GoalPeriod, string> = {
  DAILY: "Aujourd'hui",
  WEEKLY: "Cette semaine",
  MONTHLY: "Ce mois",
};

function GoalItem({ goal, compact }: { goal: StudyGoal; compact?: boolean }) {
  const config = goalTypeConfig[goal.type];
  const Icon = config.icon;
  const progress = Math.min(
    100,
    Math.round((goal.currentValue / goal.target) * 100),
  );
  const timeRemaining = getTimeRemaining(goal.periodEnd);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border p-2",
          goal.isCompleted
            ? "border-emerald-200 bg-emerald-50"
            : "border-gray-100 bg-white",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            goal.isCompleted ? "bg-emerald-500 text-white" : config.bgColor,
          )}
        >
          {goal.isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Icon className={cn("h-4 w-4", config.color)} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {goal.currentValue}/{goal.target} {config.unit}
          </p>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                goal.isCompleted
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-violet-500 to-purple-600",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Zap className="h-3 w-3 text-amber-500" />
          <span className="font-medium text-amber-600">+{goal.xpReward}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        goal.isCompleted
          ? "border-emerald-200 bg-emerald-50"
          : "border-gray-100 bg-white hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              goal.isCompleted ? "bg-emerald-500 text-white" : config.bgColor,
            )}
          >
            {goal.isCompleted ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Icon className={cn("h-5 w-5", config.color)} />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{config.label}</p>
            <p className="text-xs text-gray-500">{periodLabels[goal.period]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1">
          <Zap className="h-3 w-3 text-amber-600" />
          <span className="text-xs font-semibold text-amber-700">
            +{goal.xpReward} XP
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progression</span>
          <span className="font-semibold text-gray-900">
            {goal.currentValue}/{goal.target} {config.unit}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              goal.isCompleted
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-violet-500 to-purple-600",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {!goal.isCompleted && timeRemaining && (
        <p className="mt-3 text-xs text-gray-400">{timeRemaining}</p>
      )}

      {goal.isCompleted && (
        <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3 w-3" />
          <span>Objectif atteint !</span>
        </div>
      )}
    </div>
  );
}

function getTimeRemaining(periodEnd: string): string | null {
  const end = new Date(periodEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return null;

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

  if (days > 0) {
    return `${days} jour${days > 1 ? "s" : ""} restant${days > 1 ? "s" : ""}`;
  }
  return `${hours} heure${hours > 1 ? "s" : ""} restante${hours > 1 ? "s" : ""}`;
}

export function StudyGoalCard({
  childId,
  className,
  compact = false,
}: StudyGoalCardProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGoals() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/goals?childId=${childId}&activeOnly=true`,
        );
        if (!res.ok) throw new Error("Erreur chargement objectifs");

        const data = await res.json();
        setGoals(data.goals || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGoals();
  }, [childId]);

  // Also update progress on load
  useEffect(() => {
    async function updateProgress() {
      try {
        await fetch("/api/goals/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId }),
        });
        // Refetch goals after update
        const res = await fetch(
          `/api/goals?childId=${childId}&activeOnly=true`,
        );
        if (res.ok) {
          const data = await res.json();
          setGoals(data.goals || []);
        }
      } catch {
        // Silent fail for progress update
      }
    }

    if (childId) {
      updateProgress();
    }
  }, [childId]);

  if (isLoading) {
    return (
      <div className={cn("rounded-xl bg-white p-4 shadow-sm", className)}>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900">Mes Objectifs</h3>
        </div>
        <div className="mt-4 space-y-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-xl bg-white p-4 shadow-sm", className)}>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900">Mes Objectifs</h3>
        </div>
        <p className="mt-4 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className={cn("rounded-xl bg-white p-4 shadow-sm", className)}>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900">Mes Objectifs</h3>
        </div>
        <div className="mt-4 flex flex-col items-center py-4 text-center">
          <Target className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            Pas d&apos;objectif pour le moment
          </p>
          <p className="text-xs text-gray-400">
            Demande a tes parents d&apos;en creer un !
          </p>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <div className={cn("rounded-xl bg-white p-4 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900">Mes Objectifs</h3>
        </div>
        {completedGoals.length > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            {completedGoals.length} termine
            {completedGoals.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {activeGoals.slice(0, compact ? 2 : 5).map((goal) => (
          <GoalItem key={goal.id} goal={goal} compact={compact} />
        ))}
        {!compact &&
          completedGoals
            .slice(0, 2)
            .map((goal) => (
              <GoalItem key={goal.id} goal={goal} compact={compact} />
            ))}
      </div>

      {goals.length > (compact ? 2 : 7) && (
        <button className="mt-3 flex w-full items-center justify-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
          Voir tous les objectifs
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
