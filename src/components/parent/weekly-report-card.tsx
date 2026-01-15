"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Clock,
  Brain,
  Flame,
  Trophy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn, formatWeekRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface WeeklyReport {
  id: string;
  childId: string;
  weekStart: string;
  weekEnd: string;
  lessonsCompleted: number;
  quizzesCompleted: number;
  averageQuizScore: number | null;
  totalTimeSpent: number;
  xpEarned: number;
  streakDays: number;
  lessonsCompletedDelta: number | null;
  timeSpentDelta: number | null;
  summary: string | null;
  strengths: string[] | null;
  areasToImprove: string[] | null;
  recommendations: Recommendation[] | null;
  encouragement: string | null;
  parentTips: string | null;
}

interface WeeklyReportCardProps {
  childId: string;
  childName: string;
  className?: string;
}

export function WeeklyReportCard({
  childId,
  childName,
  className,
}: WeeklyReportCardProps) {
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/weekly?childId=${childId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReports(data.reports || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const generateReport = async (weekOffset: number = 0) => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/reports/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, weekOffset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh reports list
      await fetchReports();
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentReport = reports[currentIndex];

  const renderDelta = (value: number | null, unit: string) => {
    if (value === null) return null;
    const isPositive = value > 0;
    const isNeutral = value === 0;
    const Icon = isPositive ? TrendingUp : isNeutral ? Minus : TrendingDown;
    const color = isPositive
      ? "text-emerald-500"
      : isNeutral
        ? "text-gray-400"
        : "text-amber-500";

    return (
      <span className={cn("flex items-center gap-1 text-xs", color)}>
        <Icon className="h-3 w-3" />
        {isPositive ? "+" : ""}
        {value} {unit}
      </span>
    );
  };

  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-amber-200 bg-amber-50",
    low: "border-blue-200 bg-blue-50",
  };

  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Rapport Hebdomadaire - {childName}
            </h3>
            <p className="text-xs text-gray-500">
              Suivi personnalise de la progression
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <Button
          onClick={() => generateReport(0)}
          disabled={isGenerating}
          size="sm"
          className="gap-2 bg-blue-500 text-white hover:bg-blue-600"
        >
          <RefreshCw
            className={cn("h-4 w-4", isGenerating && "animate-spin")}
          />
          {isGenerating ? "Generation..." : "Actualiser"}
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {/* Error state */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {/* Empty state */}
          {!isLoading && reports.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-blue-200" />
              <p className="mt-4 text-sm text-gray-500">
                Aucun rapport disponible
              </p>
              <Button
                onClick={() => generateReport(0)}
                disabled={isGenerating}
                className="mt-4 gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <RefreshCw
                  className={cn("h-4 w-4", isGenerating && "animate-spin")}
                />
                Generer le premier rapport
              </Button>
            </div>
          )}

          {/* Report content */}
          {!isLoading && currentReport && (
            <div className="space-y-6">
              {/* Week navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentIndex >= reports.length - 1}
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Semaine precedente
                </Button>
                <span className="text-sm font-medium text-gray-700">
                  {formatWeekRange(
                    new Date(currentReport.weekStart),
                    new Date(currentReport.weekEnd),
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentIndex <= 0}
                  onClick={() => setCurrentIndex(currentIndex - 1)}
                >
                  Semaine suivante
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {currentReport.lessonsCompleted}
                  </p>
                  <p className="text-xs text-gray-500">Leçons completees</p>
                  {renderDelta(currentReport.lessonsCompletedDelta, "lecon(s)")}
                </div>

                <div className="rounded-xl bg-blue-50 p-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {currentReport.totalTimeSpent}
                    <span className="text-sm font-normal">min</span>
                  </p>
                  <p className="text-xs text-gray-500">Temps d&apos;etude</p>
                  {renderDelta(currentReport.timeSpentDelta, "min")}
                </div>

                <div className="rounded-xl bg-purple-50 p-3">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {currentReport.averageQuizScore !== null
                      ? `${Math.round(currentReport.averageQuizScore)}%`
                      : "-"}
                  </p>
                  <p className="text-xs text-gray-500">Score moyen quiz</p>
                  <span className="text-xs text-gray-400">
                    {currentReport.quizzesCompleted} quiz
                  </span>
                </div>

                <div className="rounded-xl bg-orange-50 p-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <p className="mt-2 text-xl font-bold text-gray-900">
                    {currentReport.streakDays}
                    <span className="text-sm font-normal">j</span>
                  </p>
                  <p className="text-xs text-gray-500">Jours actifs</p>
                  <span className="text-xs text-gray-400">
                    +{currentReport.xpEarned} XP
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              {currentReport.summary && (
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    Resume de la semaine
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {currentReport.summary}
                  </p>
                </div>
              )}

              {/* Strengths & Areas to improve */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Strengths */}
                {currentReport.strengths &&
                  currentReport.strengths.length > 0 && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <Star className="h-4 w-4" />
                        Points forts
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {currentReport.strengths.map((strength, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-emerald-600"
                          >
                            <Trophy className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Areas to improve */}
                {currentReport.areasToImprove &&
                  currentReport.areasToImprove.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                        <TrendingUp className="h-4 w-4" />
                        Axes d&apos;amelioration
                      </h4>
                      <ul className="mt-2 space-y-1">
                        {currentReport.areasToImprove.map((area, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-amber-600"
                          >
                            <Lightbulb className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>

              {/* Recommendations */}
              {currentReport.recommendations &&
                currentReport.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      Recommandations
                    </h4>
                    {currentReport.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border p-3",
                          priorityColors[rec.priority],
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {rec.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              {/* Encouragement for child */}
              {currentReport.encouragement && (
                <div className="rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                  <h4 className="text-sm font-semibold text-purple-700">
                    Message pour {childName}
                  </h4>
                  <p className="mt-2 text-sm italic text-purple-600">
                    &quot;{currentReport.encouragement}&quot;
                  </p>
                </div>
              )}

              {/* Tips for parent */}
              {currentReport.parentTips && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Conseils pour vous
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {currentReport.parentTips}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
