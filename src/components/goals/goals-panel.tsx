"use client";

import { useState, useEffect, useCallback } from "react";
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
  Trash2,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GoalFormDialog } from "./goal-form-dialog";
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
  isActive: boolean;
}

interface GoalsPanelProps {
  childId: string;
  childName: string;
  className?: string;
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
    label: "Leçons",
    unit: "leçons",
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
  DAILY: "Quotidien",
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};

export function GoalsPanel({ childId, childName, className }: GoalsPanelProps) {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/goals?childId=${childId}&activeOnly=false`);
      if (!res.ok) throw new Error("Erreur chargement objectifs");

      const data = await res.json();
      setGoals(data.goals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur suppression");
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch {
      // Handle error silently or show toast
    }
  };

  const handleToggleActive = async (goalId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!res.ok) throw new Error("Erreur mise a jour");
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, isActive: !isActive } : g)),
      );
    } catch {
      // Handle error silently or show toast
    }
  };

  const activeGoals = goals.filter((g) => g.isActive && !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);
  const inactiveGoals = goals.filter((g) => !g.isActive && !g.isCompleted);

  return (
    <div className={cn("rounded-2xl bg-white p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold text-gray-900">
            Objectifs de {childName}
          </h3>
        </div>
        <GoalFormDialog
          childId={childId}
          childName={childName}
          onSuccess={fetchGoals}
        />
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : error ? (
        <p className="mt-4 text-sm text-red-500">{error}</p>
      ) : goals.length === 0 ? (
        <div className="mt-6 flex flex-col items-center py-6 text-center">
          <Target className="h-12 w-12 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">
            Aucun objectif pour le moment
          </p>
          <p className="text-xs text-gray-400">
            Creez un objectif pour motiver {childName}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase text-gray-400">
                En cours ({activeGoals.length})
              </h4>
              <div className="space-y-3">
                {activeGoals.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase text-gray-400">
                Termines ({completedGoals.length})
              </h4>
              <div className="space-y-3">
                {completedGoals.slice(0, 3).map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Goals */}
          {inactiveGoals.length > 0 && (
            <div>
              <h4 className="mb-3 text-xs font-medium uppercase text-gray-400">
                Inactifs ({inactiveGoals.length})
              </h4>
              <div className="space-y-3">
                {inactiveGoals.map((goal) => (
                  <GoalRow
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoalRow({
  goal,
  onDelete,
  onToggleActive,
}: {
  goal: StudyGoal;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}) {
  const config = goalTypeConfig[goal.type];
  const Icon = config.icon;
  const progress = Math.min(
    100,
    Math.round((goal.currentValue / goal.target) * 100),
  );

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        goal.isCompleted
          ? "border-emerald-200 bg-emerald-50"
          : !goal.isActive
            ? "border-gray-200 bg-gray-50 opacity-60"
            : "border-gray-100 bg-white",
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
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{periodLabels[goal.period]}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-500" />
                {goal.xpReward} XP
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onToggleActive(goal.id, goal.isActive)}
            >
              {goal.isActive ? "Desactiver" : "Activer"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(goal.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {goal.currentValue}/{goal.target} {config.unit}
          </span>
          <span className="font-semibold text-gray-900">{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
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
    </div>
  );
}
