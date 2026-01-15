"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Target,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface WeakArea {
  id: string;
  topic: string;
  subject: string;
  gradeLevel: string;
  category: string | null;
  errorCount: number;
  attemptCount: number;
  lastErrorAt: string;
  isResolved: boolean;
}

interface WeakAreasPanelProps {
  childId: string;
  childName: string;
  className?: string;
}

const subjectLabels: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

const categoryLabels: Record<string, string> = {
  calcul: "Calcul",
  compréhension: "Comprehension",
  methode: "Methode",
  memorisation: "Memorisation",
  application: "Application",
  analyse: "Analyse",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  return date.toLocaleDateString("fr-FR");
}

function getSeverityLevel(
  errorCount: number,
  attemptCount: number,
): "high" | "medium" | "low" {
  const errorRate = errorCount / attemptCount;
  if (errorRate > 0.7 || errorCount >= 5) return "high";
  if (errorRate > 0.4 || errorCount >= 3) return "medium";
  return "low";
}

const severityStyles = {
  high: {
    bg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    icon: "text-red-500",
  },
  medium: {
    bg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "text-amber-500",
  },
  low: {
    bg: "bg-blue-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    icon: "text-blue-500",
  },
};

export function WeakAreasPanel({
  childId,
  childName,
  className,
}: WeakAreasPanelProps) {
  const [weakAreas, setWeakAreas] = useState<WeakArea[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const fetchWeakAreas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/children/${childId}/weak-areas`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de chargement");
      }

      setWeakAreas(data.weakAreas);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  // Fetch on mount
  useEffect(() => {
    fetchWeakAreas();
  }, [fetchWeakAreas]);

  const activeWeakAreas = weakAreas?.filter((wa) => !wa.isResolved) || [];
  const resolvedWeakAreas = weakAreas?.filter((wa) => wa.isResolved) || [];

  // Group by subject for better visualization
  const groupedBySubject = activeWeakAreas.reduce(
    (acc, wa) => {
      const subject = wa.subject;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(wa);
      return acc;
    },
    {} as Record<string, WeakArea[]>,
  );

  return (
    <div className={cn("rounded-2xl bg-white shadow-sm", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Points a Ameliorer - {childName}
            </h3>
            <p className="text-xs text-gray-500">
              {activeWeakAreas.length > 0
                ? `${activeWeakAreas.length} point${activeWeakAreas.length > 1 ? "s" : ""} a travailler`
                : "Aucun point faible detecte"}
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        <Button
          onClick={fetchWeakAreas}
          disabled={isLoading}
          size="sm"
          variant="ghost"
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
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
          {isLoading && !weakAreas && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">Chargement...</p>
            </div>
          )}

          {/* Empty state */}
          {weakAreas && activeWeakAreas.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-300" />
              <p className="mt-4 text-sm font-medium text-emerald-600">
                Excellent travail !
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {childName} n&apos;a pas de points faibles detectes
              </p>
              {resolvedWeakAreas.length > 0 && (
                <button
                  onClick={() => setShowResolved(!showResolved)}
                  className="mt-4 text-xs text-emerald-600 hover:underline"
                >
                  Voir les {resolvedWeakAreas.length} points maitrises
                </button>
              )}
            </div>
          )}

          {/* Weak areas list by subject */}
          {weakAreas && activeWeakAreas.length > 0 && (
            <div className="space-y-4">
              {Object.entries(groupedBySubject).map(
                ([subject, subjectWeakAreas]) => (
                  <div key={subject}>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                      <h4 className="text-sm font-medium text-gray-700">
                        {subjectLabels[subject] || subject}
                      </h4>
                      <span className="text-xs text-gray-400">
                        ({subjectWeakAreas.length})
                      </span>
                    </div>

                    <div className="space-y-2">
                      {subjectWeakAreas
                        .sort((a, b) => b.errorCount - a.errorCount)
                        .map((wa) => {
                          const severity = getSeverityLevel(
                            wa.errorCount,
                            wa.attemptCount,
                          );
                          const style = severityStyles[severity];

                          return (
                            <div
                              key={wa.id}
                              className={cn(
                                "flex items-start gap-3 rounded-xl border p-3 transition-all",
                                style.bg,
                              )}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {severity === "high" ? (
                                  <AlertCircle
                                    className={cn("h-5 w-5", style.icon)}
                                  />
                                ) : (
                                  <TrendingDown
                                    className={cn("h-5 w-5", style.icon)}
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-900">
                                    {wa.topic}
                                  </p>
                                  <span
                                    className={cn(
                                      "flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                                      style.badge,
                                    )}
                                  >
                                    {wa.errorCount} erreur
                                    {wa.errorCount > 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                  {wa.category && (
                                    <>
                                      <span>
                                        {categoryLabels[wa.category] ||
                                          wa.category}
                                      </span>
                                      <span>•</span>
                                    </>
                                  )}
                                  <span>
                                    Derniere erreur:{" "}
                                    {formatRelativeTime(wa.lastErrorAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ),
              )}

              {/* Toggle resolved */}
              {resolvedWeakAreas.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <button
                    onClick={() => setShowResolved(!showResolved)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {showResolved
                      ? "Masquer"
                      : `Voir les ${resolvedWeakAreas.length} points maitrises`}
                  </button>

                  {showResolved && (
                    <div className="mt-3 space-y-2">
                      {resolvedWeakAreas.map((wa) => (
                        <div
                          key={wa.id}
                          className="flex items-center gap-3 rounded-lg bg-emerald-50 border border-emerald-100 p-3"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{wa.topic}</p>
                            <p className="text-xs text-gray-500">
                              {subjectLabels[wa.subject] || wa.subject}
                            </p>
                          </div>
                          <span className="text-xs text-emerald-600">
                            Maitrise
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Advice footer */}
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-xs text-gray-600">
                  <strong>Conseil :</strong> Encouragez {childName} a revoir les
                  leçons liees a ces points. Les quiz adaptatifs cibleront
                  automatiquement ces difficultes.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
