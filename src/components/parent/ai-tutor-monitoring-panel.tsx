"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  BookOpen,
  Clock,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface AITutorStats {
  totalConversations: number;
  totalQuestions: number;
  questionsThisWeek: number;
  avgQuestionsPerSession: number;
  lastActivity: string | null;
  subjectBreakdown: Array<{
    subject: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  recentTopics: Array<{
    id: string;
    title: string;
    courseTitle: string | null;
    lessonTitle: string | null;
    messageCount: number;
    lastMessageAt: string;
  }>;
  weeklyTrend: Array<{
    week: string;
    questions: number;
  }>;
}

interface AITutorMonitoringPanelProps {
  childId: string;
  childName: string;
  className?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  MATHEMATIQUES: "bg-blue-500",
  FRANCAIS: "bg-purple-500",
  HISTOIRE_GEO: "bg-amber-500",
  SCIENCES: "bg-green-500",
  ANGLAIS: "bg-red-500",
  PHYSIQUE_CHIMIE: "bg-cyan-500",
  SVT: "bg-lime-500",
  PHILOSOPHIE: "bg-indigo-500",
  ESPAGNOL: "bg-orange-500",
  ALLEMAND: "bg-yellow-500",
  SES: "bg-rose-500",
  NSI: "bg-teal-500",
  GENERAL: "bg-gray-500",
};

export function AITutorMonitoringPanel({
  childId,
  childName,
  className,
}: AITutorMonitoringPanelProps) {
  const [stats, setStats] = useState<AITutorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/children/${childId}/ai-tutor-stats`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erreur de chargement");
        }

        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [childId]);

  if (isLoading) {
    return (
      <div className={cn("rounded-2xl bg-white p-6 shadow-sm", className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-1 h-3 w-32" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("rounded-2xl bg-white p-6 shadow-sm", className)}>
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const hasActivity = stats.totalConversations > 0;

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
              Assistant IA - {childName}
            </h3>
            <p className="text-xs text-gray-500">
              Suivi de l&apos;utilisation du tuteur IA
            </p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {stats.lastActivity && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>
              Derniere activité:{" "}
              {formatDistanceToNow(new Date(stats.lastActivity), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4">
          {!hasActivity ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50">
                <MessageSquare className="h-8 w-8 text-violet-300" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900">
                Aucune conversation avec l&apos;assistant IA
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {childName} n&apos;a pas encore utilise le tuteur IA
              </p>
              <p className="mt-3 max-w-xs text-xs text-gray-400">
                L&apos;assistant IA aide les élèves a comprendre leurs cours en
                posant des questions guidees sans donner les réponses
                directement
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={MessageSquare}
                  label="Total questions"
                  value={stats.totalQuestions.toString()}
                  subLabel="depuis l'inscription"
                  color="violet"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Cette semaine"
                  value={stats.questionsThisWeek.toString()}
                  subLabel="questions posees"
                  color="emerald"
                  highlight={stats.questionsThisWeek > 0}
                />
                <StatCard
                  icon={BookOpen}
                  label="Conversations"
                  value={stats.totalConversations.toString()}
                  subLabel="sessions de travail"
                  color="blue"
                />
                <StatCard
                  icon={BarChart3}
                  label="Moyenne"
                  value={stats.avgQuestionsPerSession.toFixed(1)}
                  subLabel="questions/session"
                  color="orange"
                />
              </div>

              {/* Subject Breakdown */}
              {stats.subjectBreakdown.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Repartition par matiere
                  </h4>
                  <div className="space-y-2">
                    {stats.subjectBreakdown.map((subject) => (
                      <div
                        key={subject.subject}
                        className="flex items-center gap-3"
                      >
                        <div className="w-28 flex-shrink-0 text-xs text-gray-600">
                          {subject.label}
                        </div>
                        <div className="flex-1">
                          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                SUBJECT_COLORS[subject.subject] ||
                                  "bg-gray-400",
                              )}
                              style={{ width: `${subject.percentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-16 flex-shrink-0 text-right text-xs text-gray-500">
                          {subject.count} ({subject.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Topics */}
              {stats.recentTopics.length > 0 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Conversations recentes
                  </h4>
                  <div className="space-y-2">
                    {stats.recentTopics.map((topic) => (
                      <div
                        key={topic.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 p-3"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-50">
                          <MessageSquare className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {topic.courseTitle ||
                              topic.title ||
                              "Discussion générale"}
                          </p>
                          {topic.lessonTitle && (
                            <p className="truncate text-xs text-gray-500">
                              {topic.lessonTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs font-medium text-gray-600">
                            {topic.messageCount} msg
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(
                              new Date(topic.lastMessageAt),
                              {
                                addSuffix: true,
                                locale: fr,
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weekly Trend */}
              {stats.weeklyTrend.length > 1 && (
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">
                    Tendance hebdomadaire
                  </h4>
                  <div className="flex items-end gap-2 rounded-xl bg-gray-50 p-4">
                    {stats.weeklyTrend.map((week, index) => {
                      const maxQuestions = Math.max(
                        ...stats.weeklyTrend.map((w) => w.questions),
                      );
                      const height =
                        maxQuestions > 0
                          ? (week.questions / maxQuestions) * 100
                          : 0;

                      return (
                        <div
                          key={week.week}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <div className="relative h-20 w-full">
                            <div
                              className={cn(
                                "absolute bottom-0 left-1/2 w-6 -translate-x-1/2 rounded-t transition-all",
                                index === stats.weeklyTrend.length - 1
                                  ? "bg-violet-500"
                                  : "bg-violet-200",
                              )}
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">
                              {week.questions}
                            </p>
                            <p className="text-xs text-gray-400">{week.week}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info Footer */}
              <div className="rounded-lg bg-violet-50 p-3">
                <p className="text-xs text-violet-700">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  L&apos;assistant IA utilise la methode socratique : il guide{" "}
                  {childName} vers la compréhension en posant des questions,
                  sans donner les réponses directement.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subLabel: string;
  color: "violet" | "emerald" | "blue" | "orange";
  highlight?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subLabel,
  color,
  highlight,
}: StatCardProps) {
  const colorClasses = {
    violet: {
      bg: "bg-violet-50",
      icon: "text-violet-500",
      value: "text-violet-700",
    },
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
      value: "text-emerald-700",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-500",
      value: "text-blue-700",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-500",
      value: "text-orange-700",
    },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={cn(
        "rounded-xl p-4 transition-all",
        colors.bg,
        highlight && "ring-2 ring-emerald-300",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", colors.icon)} />
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <p className={cn("mt-2 text-2xl font-bold", colors.value)}>{value}</p>
      <p className="text-xs text-gray-500">{subLabel}</p>
    </div>
  );
}
