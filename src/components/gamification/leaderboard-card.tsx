"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Crown, Flame, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import type {
  LeaderboardEntry,
  LeaderboardResponse,
} from "@/app/api/leaderboard/route";

interface LeaderboardCardProps {
  childId?: string;
  gradeLevel?: string;
  className?: string;
  compact?: boolean;
}

type Period = "weekly" | "monthly" | "all_time";

const periodLabels: Record<Period, string> = {
  weekly: "Cette semaine",
  monthly: "Ce mois",
  all_time: "Tout temps",
};

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 fill-yellow-400 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 fill-gray-300 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 fill-amber-600 text-amber-700" />;
    default:
      return null;
  }
}

function getRankBgColor(rank: number, isCurrentUser: boolean) {
  if (isCurrentUser) {
    return "bg-violet-50 border-violet-200";
  }
  switch (rank) {
    case 1:
      return "bg-yellow-50 border-yellow-200";
    case 2:
      return "bg-gray-50 border-gray-200";
    case 3:
      return "bg-amber-50 border-amber-200";
    default:
      return "bg-white border-gray-100";
  }
}

function LeaderboardRow({
  entry,
  compact,
}: {
  entry: LeaderboardEntry;
  compact?: boolean;
}) {
  const rankIcon = getRankIcon(entry.rank);
  const bgColor = getRankBgColor(entry.rank, entry.isCurrentUser);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-3 py-2",
          bgColor,
          entry.isCurrentUser && "ring-2 ring-violet-300",
        )}
      >
        <div className="flex w-6 items-center justify-center">
          {rankIcon || (
            <span className="text-sm font-medium text-gray-500">
              {entry.rank}
            </span>
          )}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-sm font-bold text-white">
          {entry.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {entry.firstName}
            {entry.isCurrentUser && (
              <span className="ml-1 text-violet-600">(Toi)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold text-violet-600">
          <span>{entry.xp.toLocaleString()}</span>
          <span className="text-xs text-gray-400">XP</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border p-3",
        bgColor,
        entry.isCurrentUser && "ring-2 ring-violet-300",
      )}
    >
      <div className="flex w-8 items-center justify-center">
        {rankIcon || (
          <span className="text-lg font-bold text-gray-400">#{entry.rank}</span>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-lg font-bold text-white shadow-md">
        {entry.firstName.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">
          {entry.firstName}
          {entry.isCurrentUser && (
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              Toi
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Niveau {entry.level}</span>
          {entry.currentStreak > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Flame className="h-3 w-3 fill-orange-400 text-orange-500" />
                {entry.currentStreak}j
              </span>
            </>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-violet-600">
          {entry.xp.toLocaleString()}
        </p>
        <p className="text-xs text-gray-400">XP</p>
      </div>
    </div>
  );
}

export function LeaderboardCard({
  childId,
  gradeLevel,
  className,
  compact = false,
}: LeaderboardCardProps) {
  const [period, setPeriod] = useState<Period>("weekly");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          period,
          limit: compact ? "5" : "10",
        });
        if (childId) params.set("childId", childId);
        if (gradeLevel) params.set("gradeLevel", gradeLevel);

        const res = await fetch(`/api/leaderboard?${params.toString()}`);
        if (!res.ok) throw new Error("Erreur chargement classement");

        const json: LeaderboardResponse = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [period, childId, gradeLevel, compact]);

  if (compact) {
    return (
      <div className={cn("rounded-xl bg-white p-4 shadow-sm", className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900">Classement</h3>
          </div>
          <Link
            href="/student/leaderboard"
            className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700"
          >
            Voir tout
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <p className="py-4 text-center text-sm text-red-500">{error}</p>
        ) : data?.leaderboard.length === 0 ? (
          <div className="flex flex-col items-center py-4 text-gray-500">
            <Users className="mb-2 h-8 w-8" />
            <p className="text-sm">Pas encore de participants</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data?.leaderboard.slice(0, 5).map((entry) => (
              <LeaderboardRow key={entry.childId} entry={entry} compact />
            ))}
            {data?.currentUserRank &&
              !data.leaderboard.some(
                (e) => e.childId === data.currentUserRank?.childId,
              ) && (
                <>
                  <div className="my-2 border-t border-dashed border-gray-200" />
                  <LeaderboardRow entry={data.currentUserRank} compact />
                </>
              )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl bg-white p-6 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Classement</h3>
        </div>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === p
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {data?.totalParticipants !== undefined && (
        <p className="mb-4 text-sm text-gray-500">
          {data.totalParticipants} participant
          {data.totalParticipants > 1 ? "s" : ""}{" "}
          {periodLabels[period].toLowerCase()}
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      ) : error ? (
        <p className="py-8 text-center text-red-500">{error}</p>
      ) : data?.leaderboard.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-gray-500">
          <Users className="mb-3 h-12 w-12" />
          <p className="font-medium">Pas encore de participants</p>
          <p className="text-sm">Sois le premier a gagner des XP!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.leaderboard.map((entry) => (
            <LeaderboardRow key={entry.childId} entry={entry} />
          ))}
          {data?.currentUserRank &&
            !data.leaderboard.some(
              (e) => e.childId === data.currentUserRank?.childId,
            ) && (
              <>
                <div className="my-3 flex items-center gap-2">
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                  <span className="text-xs text-gray-400">Ta position</span>
                  <div className="flex-1 border-t border-dashed border-gray-200" />
                </div>
                <LeaderboardRow entry={data.currentUserRank} />
              </>
            )}
        </div>
      )}

      <Link
        href="/student/leaderboard"
        className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
      >
        Voir le classement complet
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
