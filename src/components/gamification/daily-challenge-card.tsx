"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Target,
  Trophy,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  BookOpen,
  Brain,
  MessageSquare,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DailyChallengeType } from "@prisma/client";

interface Challenge {
  id: string;
  type: DailyChallengeType;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  difficulty: string;
  xpReward: number;
  bonusXp: number;
  isCompleted: boolean;
  completedAt: string | null;
  encouragement: string | null;
  completionMessage: string | null;
  expiresAt: string;
}

interface DailyChallengeCardProps {
  childId: string;
  className?: string;
  compact?: boolean;
}

const CHALLENGE_ICONS: Record<DailyChallengeType, React.ReactNode> = {
  QUIZ: <Target className="h-5 w-5" />,
  LESSON: <BookOpen className="h-5 w-5" />,
  TIME_SPENT: <Clock className="h-5 w-5" />,
  AI_QUESTIONS: <MessageSquare className="h-5 w-5" />,
  STREAK: <Flame className="h-5 w-5" />,
  PERFECT_QUIZ: <Trophy className="h-5 w-5" />,
  REVIEW: <Brain className="h-5 w-5" />,
};

const DIFFICULTY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  easy: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  hard: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
  },
};

function ChallengeItem({
  challenge,
  compact = false,
}: {
  challenge: Challenge;
  compact?: boolean;
}) {
  const progress = Math.min(
    100,
    Math.round((challenge.currentValue / challenge.targetValue) * 100),
  );
  const colors =
    DIFFICULTY_COLORS[challenge.difficulty] || DIFFICULTY_COLORS.medium;
  const Icon = CHALLENGE_ICONS[challenge.type] || (
    <Target className="h-5 w-5" />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        challenge.isCompleted
          ? "border-emerald-200 bg-emerald-50/50"
          : colors.border + " bg-white hover:shadow-md",
      )}
    >
      {/* Completion overlay */}
      <AnimatePresence>
        {challenge.isCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-2 top-2"
          >
            <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-xs font-medium text-white">
              <CheckCircle2 className="h-3 w-3" />
              Complete
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            challenge.isCompleted
              ? "bg-emerald-100 text-emerald-600"
              : colors.bg + " " + colors.text,
          )}
        >
          {Icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                "font-semibold",
                challenge.isCompleted ? "text-emerald-700" : "text-gray-900",
              )}
            >
              {challenge.title}
            </h3>
            {!challenge.isCompleted && !compact && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  colors.bg,
                  colors.text,
                )}
              >
                {challenge.difficulty === "easy"
                  ? "Facile"
                  : challenge.difficulty === "medium"
                    ? "Moyen"
                    : "Difficile"}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-gray-500">{challenge.description}</p>

          {/* Progress bar */}
          {!challenge.isCompleted && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {challenge.currentValue}/{challenge.targetValue}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    progress >= 100
                      ? "bg-emerald-500"
                      : progress >= 50
                        ? "bg-amber-500"
                        : "bg-violet-500",
                  )}
                />
              </div>
            </div>
          )}

          {/* Rewards */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm">
              <Zap
                className={cn(
                  "h-4 w-4",
                  challenge.isCompleted ? "text-emerald-500" : "text-amber-500",
                )}
              />
              <span
                className={cn(
                  "font-medium",
                  challenge.isCompleted ? "text-emerald-600" : "text-amber-600",
                )}
              >
                {challenge.isCompleted ? "+" : ""}
                {challenge.xpReward} XP
              </span>
            </div>
            {challenge.bonusXp > 0 && !challenge.isCompleted && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Sparkles className="h-3 w-3" />
                <span>+{challenge.bonusXp} bonus si tot</span>
              </div>
            )}
          </div>

          {/* Encouragement or completion message */}
          {!compact && (
            <p className="mt-2 text-xs italic text-gray-400">
              {challenge.isCompleted
                ? challenge.completionMessage
                : challenge.encouragement}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function DailyChallengeCard({
  childId,
  className,
  compact = false,
}: DailyChallengeCardProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<{
    total: number;
    completed: number;
    totalXpPotential: number;
    earnedXp: number;
    allCompleted: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  // Fetch challenges
  useEffect(() => {
    async function fetchChallenges() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/daily-challenges?childId=${childId}`);
        if (!res.ok) throw new Error("Failed to fetch challenges");
        const data = await res.json();
        setChallenges(data.challenges || []);
        setStats(data.stats || null);
      } catch (err) {
        setError("Impossible de charger les defis");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenges();
  }, [childId]);

  // Update countdown timer
  useEffect(() => {
    function updateTimer() {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Expire");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining(`${minutes}m`);
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl bg-white p-6 shadow-sm", className)}>
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-40 rounded bg-gray-200" />
            <div className="h-6 w-20 rounded bg-gray-200" />
          </div>
          <div className="space-y-3">
            <div className="h-24 rounded-xl bg-gray-100" />
            <div className="h-24 rounded-xl bg-gray-100" />
            <div className="h-24 rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-2xl bg-white p-6 shadow-sm", className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <HelpCircle className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  const completedCount = stats?.completed || 0;
  const totalCount = stats?.total || 0;
  const allCompleted = stats?.allCompleted || false;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4",
          allCompleted
            ? "bg-gradient-to-r from-emerald-500 to-teal-500"
            : "bg-gradient-to-r from-violet-500 to-purple-600",
        )}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              {allCompleted ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Flame className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="font-bold">
                {allCompleted ? "Defis Completes !" : "Defis du Jour"}
              </h2>
              <p className="text-sm text-white/80">
                {completedCount}/{totalCount} termines
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span>{timeRemaining}</span>
            </div>
            {stats && (
              <div className="flex items-center gap-1 text-xs text-white/70">
                <Zap className="h-3 w-3" />
                {stats.earnedXp}/{stats.totalXpPotential} XP
              </div>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {!allCompleted && totalCount > 0 && (
          <div className="mt-3">
            <div className="flex gap-1.5">
              {Array.from({ length: totalCount }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all",
                    i < completedCount ? "bg-white" : "bg-white/30",
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Challenges list */}
      <div className="p-4">
        {challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Sparkles className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-sm text-gray-500">
              Les defis du jour arrivent bientot !
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <ChallengeItem
                key={challenge.id}
                challenge={challenge}
                compact={compact}
              />
            ))}
          </div>
        )}

        {/* All completed celebration */}
        {allCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
              <span className="font-semibold text-emerald-700">
                Bravo ! Tous les defis sont termines !
              </span>
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="mt-2 text-sm text-emerald-600">
              Reviens demain pour de nouveaux defis
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
