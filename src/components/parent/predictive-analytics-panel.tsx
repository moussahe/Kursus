"use client";

import { useState, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Target,
  Loader2,
  ChevronRight,
  Sparkles,
  Calendar,
  Activity,
  Shield,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  PredictiveAnalyticsResponse,
  RiskIndicator,
  Recommendation,
  HistoricalMetrics,
} from "@/lib/ai-predictions";

interface PredictiveAnalyticsPanelProps {
  childId: string;
  childName: string;
}

interface PredictionsData {
  childId: string;
  childName: string;
  generatedAt: string;
  metrics: HistoricalMetrics;
  predictions: PredictiveAnalyticsResponse;
}

export function PredictiveAnalyticsPanel({
  childId,
  childName,
}: PredictiveAnalyticsPanelProps) {
  const [data, setData] = useState<PredictionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/parent/predictions?childId=${childId}`,
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la generation des previsions");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  const TrendIcon = ({
    trend,
    className,
  }: {
    trend: "up" | "stable" | "down" | "improving" | "declining";
    className?: string;
  }) => {
    if (trend === "up" || trend === "improving") {
      return (
        <TrendingUp className={cn("h-4 w-4 text-emerald-500", className)} />
      );
    }
    if (trend === "down" || trend === "declining") {
      return <TrendingDown className={cn("h-4 w-4 text-red-500", className)} />;
    }
    return <Minus className={cn("h-4 w-4 text-gray-400", className)} />;
  };

  const getRiskLevelStyles = (level: RiskIndicator["level"]) => {
    switch (level) {
      case "high":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          icon: "text-red-500",
          badge: "bg-red-100 text-red-700",
        };
      case "medium":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          icon: "text-amber-500",
          badge: "bg-amber-100 text-amber-700",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          icon: "text-blue-500",
          badge: "bg-blue-100 text-blue-700",
        };
    }
  };

  const getPriorityStyles = (priority: Recommendation["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "important":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-emerald-100 text-emerald-700";
    }
  };

  const getConfidenceLabel = (confidence: "high" | "medium" | "low") => {
    switch (confidence) {
      case "high":
        return "Confiance elevee";
      case "medium":
        return "Confiance moyenne";
      default:
        return "Confiance faible";
    }
  };

  if (!data) {
    return (
      <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              Previsions IA pour {childName}
            </h3>
            <p className="text-sm text-gray-500">
              Analysez les tendances et anticipez les besoins
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          onClick={fetchPredictions}
          disabled={isLoading}
          className="mt-4 w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generation en cours...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generer les previsions
            </>
          )}
        </Button>
      </div>
    );
  }

  const { predictions } = data;

  return (
    <div className="space-y-4 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Previsions pour {childName}
            </h3>
            <p className="text-xs text-gray-500">
              Mis a jour le{" "}
              {new Date(data.generatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPredictions}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Actualiser"
          )}
        </Button>
      </div>

      {/* Predictions Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Next Week Lessons */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              Semaine prochaine
            </div>
            <TrendIcon
              trend={predictions.predictions.nextWeekLessons.trend || "stable"}
            />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {predictions.predictions.nextWeekLessons.predicted} leçons
          </p>
          <p className="text-xs text-gray-400">
            {getConfidenceLabel(
              predictions.predictions.nextWeekLessons.confidence,
            )}
          </p>
        </div>

        {/* Engagement Score */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Activity className="h-4 w-4" />
              Engagement
            </div>
            <TrendIcon trend={predictions.predictions.engagementScore.trend} />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {predictions.predictions.engagementScore.current}/100
          </p>
          <p className="text-xs text-gray-400">
            Prevu: {predictions.predictions.engagementScore.predicted}/100
          </p>
        </div>

        {/* Quiz Score Forecast */}
        {predictions.predictions.quizScoreForecast.predicted !== null && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="h-4 w-4" />
                Score Quiz
              </div>
              <TrendIcon
                trend={predictions.predictions.quizScoreForecast.trend}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {predictions.predictions.quizScoreForecast.predicted}%
            </p>
            <p className="text-xs text-gray-400">Tendance prevue</p>
          </div>
        )}

        {/* Month Progress */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              Prochain mois
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {predictions.predictions.nextMonthProgress.predicted} leçons
          </p>
          <p className="text-xs text-gray-400">
            {getConfidenceLabel(
              predictions.predictions.nextMonthProgress.confidence,
            )}
          </p>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h4 className="flex items-center gap-2 font-medium text-gray-900">
          <Activity className="h-4 w-4 text-purple-500" />
          Analyse des tendances
        </h4>
        <div className="mt-3 flex flex-wrap gap-3">
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              predictions.trendAnalysis.weekOverWeek.direction === "up"
                ? "bg-emerald-50 text-emerald-700"
                : predictions.trendAnalysis.weekOverWeek.direction === "down"
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-50 text-gray-700",
            )}
          >
            Semaine:{" "}
            {predictions.trendAnalysis.weekOverWeek.direction === "up"
              ? "+"
              : predictions.trendAnalysis.weekOverWeek.direction === "down"
                ? "-"
                : ""}
            {predictions.trendAnalysis.weekOverWeek.percentage}%
          </div>
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-sm",
              predictions.trendAnalysis.velocityChange === "accelerating"
                ? "bg-emerald-50 text-emerald-700"
                : predictions.trendAnalysis.velocityChange === "slowing"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-gray-50 text-gray-700",
            )}
          >
            Velocite:{" "}
            {predictions.trendAnalysis.velocityChange === "accelerating"
              ? "En acceleration"
              : predictions.trendAnalysis.velocityChange === "slowing"
                ? "Ralentissement"
                : "Stable"}
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      {predictions.riskIndicators.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-medium text-gray-900">
            <Shield className="h-4 w-4 text-amber-500" />
            Indicateurs de risque
          </h4>
          {predictions.riskIndicators.map((risk, index) => {
            const styles = getRiskLevelStyles(risk.level);
            return (
              <div
                key={index}
                className={cn(
                  "rounded-xl border p-4",
                  styles.bg,
                  styles.border,
                )}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={cn("mt-0.5 h-5 w-5", styles.icon)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {risk.title}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          styles.badge,
                        )}
                      >
                        {risk.level === "high"
                          ? "Élève"
                          : risk.level === "medium"
                            ? "Moyen"
                            : "Faible"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {risk.probability}% probable
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {risk.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        {risk.preventiveAction}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forecast */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h4 className="flex items-center gap-2 font-medium text-gray-900">
          <Target className="h-4 w-4 text-indigo-500" />
          Previsions
        </h4>
        <div className="mt-3 space-y-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Court terme:</span>{" "}
            {predictions.forecast.shortTerm}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">Moyen terme:</span>{" "}
            {predictions.forecast.mediumTerm}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {predictions.forecast.keyFactors.map((factor, index) => (
              <span
                key={index}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-700"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {predictions.recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 font-medium text-gray-900">
            <Lightbulb className="h-4 w-4 text-yellow-500" />
            Recommandations
          </h4>
          {predictions.recommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4"
            >
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  getPriorityStyles(rec.priority),
                )}
              >
                {rec.priority === "urgent"
                  ? "Urgent"
                  : rec.priority === "important"
                    ? "Important"
                    : "Suggere"}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {rec.action}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {rec.expectedImpact}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
