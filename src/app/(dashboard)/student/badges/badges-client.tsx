"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  Flame,
  Target,
  BookOpen,
  Award,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BadgeCategory } from "@prisma/client";

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  category: BadgeCategory;
  xpReward: number;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface BadgesClientProps {
  badges: Badge[];
  stats: {
    lessonsCompleted: number;
    coursesCompleted: number;
    quizzesPassed: number;
    perfectQuizzes: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    xp: number;
  };
}

const categoryConfig: Record<
  BadgeCategory,
  { icon: typeof Trophy; color: string; bgColor: string; label: string }
> = {
  PROGRESS: {
    icon: BookOpen,
    color: "text-emerald-500",
    bgColor: "bg-emerald-100",
    label: "Progression",
  },
  STREAK: {
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
    label: "Series",
  },
  QUIZ: {
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
    label: "Quiz",
  },
  ACHIEVEMENT: {
    icon: Award,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
    label: "Accomplissements",
  },
  SOCIAL: {
    icon: Users,
    color: "text-pink-500",
    bgColor: "bg-pink-100",
    label: "Social",
  },
};

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const config = categoryConfig[badge.category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "relative rounded-2xl border p-6 transition-all",
        badge.earned
          ? "border-gray-200 bg-white hover:shadow-lg"
          : "border-gray-100 bg-gray-50",
      )}
    >
      {/* Lock overlay for unearned badges */}
      {!badge.earned && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-50/80 backdrop-blur-[1px]">
          <Lock className="h-8 w-8 text-gray-300" />
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        {/* Badge Icon */}
        <div
          className={cn(
            "mb-4 flex h-16 w-16 items-center justify-center rounded-full",
            badge.earned ? config.bgColor : "bg-gray-100",
          )}
        >
          <Icon
            className={cn(
              "h-8 w-8",
              badge.earned ? config.color : "text-gray-300",
            )}
          />
        </div>

        {/* Badge Name */}
        <h3
          className={cn(
            "text-lg font-bold",
            badge.earned ? "text-gray-900" : "text-gray-400",
          )}
        >
          {badge.name}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "mt-1 text-sm",
            badge.earned ? "text-gray-600" : "text-gray-400",
          )}
        >
          {badge.description}
        </p>

        {/* XP Reward */}
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-xs",
            badge.earned ? "text-amber-600" : "text-gray-400",
          )}
        >
          <Star className="h-3 w-3" />
          <span>+{badge.xpReward} XP</span>
        </div>

        {/* Progress bar for unearned badges with progress */}
        {!badge.earned &&
          badge.progress !== undefined &&
          badge.maxProgress !== undefined && (
            <div className="mt-4 w-full">
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${(badge.progress / badge.maxProgress) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {badge.progress}/{badge.maxProgress}
              </p>
            </div>
          )}

        {/* Earned date */}
        {badge.earned && badge.earnedAt && (
          <p className="mt-3 text-xs text-emerald-600">
            Obtenu le{" "}
            {new Date(badge.earnedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function BadgesClient({ badges, stats }: BadgesClientProps) {
  const [filter, setFilter] = useState<
    "all" | "earned" | "locked" | BadgeCategory
  >("all");

  const earnedCount = badges.filter((b) => b.earned).length;

  const filteredBadges = badges.filter((badge) => {
    if (filter === "earned") return badge.earned;
    if (filter === "locked") return !badge.earned;
    if (filter === "all") return true;
    return badge.category === filter;
  });

  // Sort: earned first, then by progress percentage
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    // Earned badges first
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;

    // For unearned, sort by progress percentage (closest to completion first)
    if (!a.earned && !b.earned) {
      const aProgress =
        a.progress && a.maxProgress ? a.progress / a.maxProgress : 0;
      const bProgress =
        b.progress && b.maxProgress ? b.progress / b.maxProgress : 0;
      return bProgress - aProgress;
    }

    // For earned, sort by earned date (most recent first)
    if (a.earnedAt && b.earnedAt) {
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime();
    }

    return 0;
  });

  // Find the next badge closest to being earned
  const nextBadge = badges
    .filter(
      (b) =>
        !b.earned && b.progress !== undefined && b.maxProgress !== undefined,
    )
    .sort((a, b) => {
      const aProgress = (a.progress ?? 0) / (a.maxProgress ?? 1);
      const bProgress = (b.progress ?? 0) / (b.maxProgress ?? 1);
      return bProgress - aProgress;
    })[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Badges</h1>
          <p className="mt-1 text-gray-500">
            {earnedCount}/{badges.length} badges obtenus
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {[
              { id: "all", label: "Tous" },
              { id: "earned", label: "Obtenus" },
              { id: "locked", label: "A debloquer" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                  filter === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Progression des badges</h2>
            <p className="text-white/80">
              {earnedCount === badges.length
                ? "Felicitations ! Tu as tous les badges !"
                : `Continue comme ca ! Plus que ${badges.length - earnedCount} badges a debloquer.`}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedCount / badges.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-white"
            />
          </div>
          <p className="mt-2 text-sm text-white/80">
            {Math.round((earnedCount / badges.length) * 100)}% complete
          </p>
        </div>
      </div>

      {/* Next Badge Hint */}
      {nextBadge && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <Sparkles className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                Prochain badge : {nextBadge.name}
              </p>
              <p className="text-sm text-amber-700">
                {nextBadge.progress}/{nextBadge.maxProgress} -{" "}
                {nextBadge.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-amber-900">
                {Math.round(
                  ((nextBadge.progress ?? 0) / (nextBadge.maxProgress ?? 1)) *
                    100,
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categoryConfig).map(([category, config]) => {
          const count = badges.filter((b) => b.category === category).length;
          const earnedInCategory = badges.filter(
            (b) => b.category === category && b.earned,
          ).length;

          if (count === 0) return null;

          return (
            <button
              key={category}
              onClick={() =>
                setFilter(
                  filter === category ? "all" : (category as BadgeCategory),
                )
              }
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer",
                filter === category
                  ? `${config.bgColor} ${config.color}`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              <config.icon className="h-4 w-4" />
              {config.label}
              <span className="text-xs opacity-70">
                {earnedInCategory}/{count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {stats.lessonsCompleted}
          </p>
          <p className="text-xs text-emerald-700">Leçons terminées</p>
        </div>
        <div className="rounded-xl bg-orange-50 p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-orange-700">Jours de serie</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {stats.perfectQuizzes}
          </p>
          <p className="text-xs text-blue-700">Quiz parfaits</p>
        </div>
        <div className="rounded-xl bg-purple-50 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.level}</p>
          <p className="text-xs text-purple-700">Niveau actuel</p>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedBadges.map((badge, index) => (
          <BadgeCard key={badge.id} badge={badge} index={index} />
        ))}
      </div>

      {sortedBadges.length === 0 && (
        <div className="rounded-2xl bg-gray-50 p-12 text-center">
          <Trophy className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-gray-500">
            {filter === "earned"
              ? "Tu n'as pas encore de badges. Continue d'apprendre !"
              : filter === "locked"
                ? "Tous les badges sont déjà debloques. Bravo !"
                : "Aucun badge dans cette categorie."}
          </p>
        </div>
      )}
    </div>
  );
}
