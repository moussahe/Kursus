"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Trophy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface Insight {
  type: "strength" | "concern" | "suggestion" | "milestone";
  title: string;
  message: string;
  priority: "high" | "medium" | "low";
}

interface AIInsightsPanelProps {
  childId: string;
  childName: string;
  className?: string;
}

const insightStyles = {
  strength: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    iconBg: "bg-emerald-100",
    IconComponent: TrendingUp,
  },
  concern: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    iconBg: "bg-amber-100",
    IconComponent: AlertTriangle,
  },
  suggestion: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    iconBg: "bg-blue-100",
    IconComponent: Lightbulb,
  },
  milestone: {
    bg: "bg-purple-50 border-purple-200",
    icon: "text-purple-500",
    iconBg: "bg-purple-100",
    IconComponent: Trophy,
  },
};

const priorityOrder = { high: 0, medium: 1, low: 2 };

export function AIInsightsPanel({
  childId,
  childName,
  className,
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de generation");
      }

      // Sort by priority
      const sortedInsights = data.insights.sort(
        (a: Insight, b: Insight) =>
          priorityOrder[a.priority] - priorityOrder[b.priority],
      );

      setInsights(sortedInsights);
      setLastGenerated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Insights IA - {childName}
            </h3>
            <p className="text-xs text-gray-500">
              Analyse personnalisee de la progression
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <Button
          onClick={generateInsights}
          disabled={isLoading}
          size="sm"
          className={cn(
            "gap-2",
            insights
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-violet-500 text-white hover:bg-violet-600",
          )}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          {isLoading
            ? "Analyse..."
            : insights
              ? "Actualiser"
              : "Generer l'analyse"}
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

          {/* Empty state */}
          {!insights && !error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-12 w-12 text-violet-200" />
              <p className="mt-4 text-sm text-gray-500">
                Generez une analyse IA personnalisee pour {childName}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                L&apos;IA analysera la progression, les points forts et les axes
                d&apos;amelioration
              </p>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-violet-100" />
                <Sparkles className="absolute inset-0 m-auto h-6 w-6 animate-pulse text-violet-500" />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Analyse de la progression de {childName}...
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Cela peut prendre quelques secondes
              </p>
            </div>
          )}

          {/* Insights list */}
          {insights && insights.length > 0 && (
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const style = insightStyles[insight.type];
                const Icon = style.IconComponent;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-4 transition-all",
                      style.bg,
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-lg p-2",
                        style.iconBg,
                      )}
                    >
                      <Icon className={cn("h-4 w-4", style.icon)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {insight.title}
                        </p>
                        {insight.priority === "high" && (
                          <span className="flex-shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              {lastGenerated && (
                <p className="mt-4 text-center text-xs text-gray-400">
                  Derniere analyse:{" "}
                  {lastGenerated.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
