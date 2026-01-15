"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Trophy,
  Medal,
  Crown,
  Flame,
  Users,
  Filter,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  LeaderboardEntry,
  LeaderboardResponse,
} from "@/app/api/leaderboard/route";
import { GradeLevel } from "@prisma/client";

type Period = "weekly" | "monthly" | "all_time";

const periodLabels: Record<Period, string> = {
  weekly: "Cette semaine",
  monthly: "Ce mois",
  all_time: "Tout temps",
};

const gradeLevelLabels: Record<GradeLevel | "ALL", string> = {
  ALL: "Tous les niveaux",
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "2nde",
  PREMIERE: "1ere",
  TERMINALE: "Terminale",
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 fill-yellow-400 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 fill-gray-300 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 fill-amber-600 text-amber-700" />;
    default:
      return null;
  }
}

function getRankStyles(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return {
      bg: "bg-violet-50",
      border: "border-violet-200",
      ring: "ring-2 ring-violet-300",
    };
  }
  switch (rank) {
    case 1:
      return { bg: "bg-yellow-50", border: "border-yellow-200", ring: "" };
    case 2:
      return { bg: "bg-gray-50", border: "border-gray-200", ring: "" };
    case 3:
      return { bg: "bg-amber-50", border: "border-amber-200", ring: "" };
    default:
      return { bg: "bg-white", border: "border-gray-100", ring: "" };
  }
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const rankIcon = getRankIcon(entry.rank);
  const styles = getRankStyles(entry.rank, entry.isCurrentUser);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 transition-all",
        styles.bg,
        styles.border,
        styles.ring,
      )}
    >
      {/* Rank */}
      <div className="flex w-12 items-center justify-center">
        {rankIcon || (
          <span className="text-xl font-bold text-gray-400">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg",
          entry.rank === 1
            ? "bg-gradient-to-br from-yellow-400 to-amber-500"
            : entry.rank === 2
              ? "bg-gradient-to-br from-gray-300 to-gray-400"
              : entry.rank === 3
                ? "bg-gradient-to-br from-amber-500 to-amber-700"
                : "bg-gradient-to-br from-violet-400 to-purple-500",
        )}
      >
        {entry.firstName.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-lg font-semibold text-gray-900">
            {entry.firstName}
          </p>
          {entry.isCurrentUser && (
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
              Toi
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
            {gradeLevelLabels[entry.gradeLevel]}
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            Niveau {entry.level}
          </span>
          {entry.currentStreak > 0 && (
            <span className="flex items-center gap-1">
              <Flame
                className={cn(
                  "h-3.5 w-3.5",
                  entry.currentStreak >= 3
                    ? "fill-orange-400 text-orange-500"
                    : "text-gray-400",
                )}
              />
              {entry.currentStreak} jours
            </span>
          )}
        </div>
      </div>

      {/* XP */}
      <div className="text-right">
        <p
          className={cn(
            "text-2xl font-bold",
            entry.rank === 1
              ? "text-yellow-600"
              : entry.rank === 2
                ? "text-gray-500"
                : entry.rank === 3
                  ? "text-amber-600"
                  : "text-violet-600",
          )}
        >
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-sm text-gray-400">XP</p>
      </div>
    </div>
  );
}

function PodiumDisplay({ top3 }: { top3: LeaderboardEntry[] }) {
  if (top3.length < 3) return null;

  const [first, second, third] = top3;

  return (
    <div className="mb-8 flex items-end justify-center gap-4">
      {/* Second Place */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-400 text-2xl font-bold text-white shadow-lg ring-4 ring-gray-200">
            {second.firstName.charAt(0).toUpperCase()}
          </div>
          <Medal className="absolute -bottom-1 -right-1 h-6 w-6 fill-gray-300 text-gray-400" />
        </div>
        <p className="mt-2 font-medium text-gray-900">{second.firstName}</p>
        <p className="text-sm text-gray-500">{second.xp.toLocaleString()} XP</p>
        <div className="mt-2 h-20 w-20 rounded-t-lg bg-gray-200" />
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-3xl font-bold text-white shadow-xl ring-4 ring-yellow-200">
            {first.firstName.charAt(0).toUpperCase()}
          </div>
          <Crown className="absolute -top-3 left-1/2 h-8 w-8 -translate-x-1/2 fill-yellow-400 text-yellow-500" />
        </div>
        <p className="mt-2 text-lg font-bold text-gray-900">
          {first.firstName}
        </p>
        <p className="text-sm font-medium text-yellow-600">
          {first.xp.toLocaleString()} XP
        </p>
        <div className="mt-2 h-28 w-24 rounded-t-lg bg-gradient-to-t from-yellow-400 to-yellow-300" />
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-xl font-bold text-white shadow-lg ring-4 ring-amber-200">
            {third.firstName.charAt(0).toUpperCase()}
          </div>
          <Medal className="absolute -bottom-1 -right-1 h-5 w-5 fill-amber-600 text-amber-700" />
        </div>
        <p className="mt-2 font-medium text-gray-900">{third.firstName}</p>
        <p className="text-sm text-gray-500">{third.xp.toLocaleString()} XP</p>
        <div className="mt-2 h-14 w-20 rounded-t-lg bg-amber-200" />
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [period, setPeriod] = useState<Period>(
    (searchParams.get("period") as Period) || "weekly",
  );
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | "ALL">(
    (searchParams.get("gradeLevel") as GradeLevel) || "ALL",
  );
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        period,
        limit: "50",
      });
      if (gradeLevel !== "ALL") {
        params.set("gradeLevel", gradeLevel);
      }

      const res = await fetch(`/api/leaderboard?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur chargement classement");

      const json: LeaderboardResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [period, gradeLevel]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("period", period);
    if (gradeLevel !== "ALL") {
      params.set("gradeLevel", gradeLevel);
    }
    router.replace(`/student/leaderboard?${params.toString()}`);
  }, [period, gradeLevel, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <Trophy className="h-8 w-8 text-amber-500" />
            Classement
          </h1>
          <p className="mt-1 text-gray-500">
            Compare tes performances avec les autres élèves
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter */}
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  period === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* Grade Level Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                {gradeLevelLabels[gradeLevel]}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-64 overflow-y-auto"
            >
              {(Object.keys(gradeLevelLabels) as (GradeLevel | "ALL")[]).map(
                (level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => setGradeLevel(level)}
                    className={cn(gradeLevel === level && "bg-violet-50")}
                  >
                    {gradeLevelLabels[level]}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {data.totalParticipants} participant
            {data.totalParticipants > 1 ? "s" : ""}
          </span>
          <span>•</span>
          <span>{periodLabels[data.period]}</span>
          {gradeLevel !== "ALL" && (
            <>
              <span>•</span>
              <span>{gradeLevelLabels[gradeLevel]}</span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchLeaderboard} className="mt-4">
            Reessayer
          </Button>
        </div>
      ) : data?.leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <Users className="mb-4 h-16 w-16" />
          <p className="text-lg font-medium">Pas encore de participants</p>
          <p className="mt-1 text-sm">
            Sois le premier a gagner des XP et apparaitre dans le classement !
          </p>
        </div>
      ) : (
        <>
          {/* Podium for top 3 */}
          {data && data.leaderboard.length >= 3 && (
            <PodiumDisplay top3={data.leaderboard.slice(0, 3)} />
          )}

          {/* Full leaderboard list */}
          <div className="space-y-3">
            {data?.leaderboard.map((entry) => (
              <LeaderboardRow key={entry.childId} entry={entry} />
            ))}
          </div>

          {/* Current user position if not in list */}
          {data?.currentUserRank &&
            !data.leaderboard.some(
              (e) => e.childId === data.currentUserRank?.childId,
            ) && (
              <>
                <div className="flex items-center gap-3 py-4">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-sm text-gray-400">Ta position</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>
                <LeaderboardRow entry={data.currentUserRank} />
              </>
            )}
        </>
      )}
    </div>
  );
}
