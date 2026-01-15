"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Brain, Clock, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RevisionStatusPanelProps {
  childId: string;
  childName: string;
}

interface RevisionStats {
  totalCards: number;
  masteredCards: number;
  dueToday: number;
  averageEaseFactor: number;
  totalReviews: number;
  successRate: number;
  streakDays: number;
}

export function RevisionStatusPanel({
  childId,
  childName,
}: RevisionStatusPanelProps) {
  const [stats, setStats] = useState<RevisionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/spaced-repetition?childId=${childId}&action=stats`,
      );
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Impossible de charger les statistiques de revision");
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-violet-500" />
            Revision Intelligente
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-violet-500" />
            Revision Intelligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            {error || "Aucune donnee disponible"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasDueCards = stats.dueToday > 0;

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-violet-500" />
          Revision Intelligente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status indicator */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl p-3",
            hasDueCards ? "bg-violet-50" : "bg-emerald-50",
          )}
        >
          {hasDueCards ? (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-violet-900">
                  {stats.dueToday} concept{stats.dueToday > 1 ? "s" : ""} a
                  reviser
                </p>
                <p className="text-sm text-violet-600">
                  {childName} devrait faire sa revision aujourd&apos;hui
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-emerald-900">Tout a jour !</p>
                <p className="text-sm text-emerald-600">
                  Aucune revision en attente pour {childName}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold text-gray-900">
              {stats.totalCards}
            </p>
            <p className="text-xs text-gray-500">Concepts</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold text-emerald-600">
              {stats.masteredCards}
            </p>
            <p className="text-xs text-gray-500">Maitrises</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 text-center">
            <p className="text-xl font-bold text-gray-900">
              {Math.round(stats.successRate)}%
            </p>
            <p className="text-xs text-gray-500">Réussite</p>
          </div>
        </div>

        {/* Explanation */}
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-700">
            La revision espacee utilise l&apos;algorithme SM-2 pour optimiser la
            memorisation. Les concepts difficiles sont revises plus souvent.
          </p>
        </div>

        {/* Action button */}
        {hasDueCards && (
          <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
            <Link href="/student/revision">
              Voir les revisions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
