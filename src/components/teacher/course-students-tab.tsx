"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  TrendingUp,
  Clock,
  Award,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lightbulb,
  Zap,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface StudentData {
  id: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  gradeLevel: string;
  xp: number;
  level: number;
  currentStreak: number;
  enrolledAt: string;
  parentName: string | null;
  parentEmail: string | null;
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    totalTimeSpent: number;
  };
  quizPerformance: {
    attemptCount: number;
    averageScore: number | null;
    passedCount: number;
    totalQuizzes: number;
  };
  lastActivity: string | null;
  engagementLevel: "high" | "medium" | "low" | "inactive";
}

interface CourseStats {
  totalStudents: number;
  avgProgress: number;
  avgQuizScore: number | null;
  completionRate: number;
  engagementBreakdown: {
    high: number;
    medium: number;
    low: number;
    inactive: number;
  };
}

interface TeacherInsight {
  type: "success" | "warning" | "improvement" | "engagement";
  title: string;
  description: string;
  action: string;
}

interface AIInsightsData {
  summary: string;
  insights: TeacherInsight[];
  topPerformingContent: string;
  areasNeedingAttention: string;
  nextSteps: string[];
}

interface CourseStudentsTabProps {
  courseId: string;
}

const engagementColors = {
  high: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
};

const engagementLabels = {
  high: "Tres actif",
  medium: "Actif",
  low: "Peu actif",
  inactive: "Inactif",
};

const gradeLabels: Record<string, string> = {
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
  TERMINALE: "Term",
};

const insightStyles = {
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    iconBg: "bg-emerald-100",
    IconComponent: CheckCircle2,
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    iconBg: "bg-amber-100",
    IconComponent: AlertTriangle,
  },
  improvement: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    iconBg: "bg-blue-100",
    IconComponent: Lightbulb,
  },
  engagement: {
    bg: "bg-purple-50 border-purple-200",
    icon: "text-purple-500",
    iconBg: "bg-purple-100",
    IconComponent: Zap,
  },
};

function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}min`;
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "Jamais";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return `Il y a ${Math.floor(diffDays / 30)} mois`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl border-0 bg-white shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CourseStudentsTab({ courseId }: CourseStudentsTabProps) {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Insights state
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [isInsightsExpanded, setIsInsightsExpanded] = useState(true);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/teacher/courses/${courseId}/students`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des étudiants");
      }
      const data = await response.json();
      setStudents(data.students);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  const generateInsights = useCallback(async () => {
    try {
      setIsLoadingInsights(true);
      setInsightsError(null);
      const response = await fetch(
        `/api/teacher/courses/${courseId}/insights`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la generation");
      }
      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoadingInsights(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchStudents} variant="outline" className="mt-4">
            Reessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Étudiants</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Progression moy.
                </p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Score quiz moy.
                </p>
                <p className="text-2xl font-bold">
                  {stats.avgQuizScore !== null ? `${stats.avgQuizScore}%` : "-"}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Taux completion
                </p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Breakdown */}
      {stats.totalStudents > 0 && (
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Repartition de l&apos;engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {(["high", "medium", "low", "inactive"] as const).map((level) => (
                <div key={level} className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      {engagementLabels[level]}
                    </span>
                    <span className="text-xs font-medium">
                      {stats.engagementBreakdown[level]}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        level === "high" && "bg-emerald-500",
                        level === "medium" && "bg-blue-500",
                        level === "low" && "bg-amber-500",
                        level === "inactive" && "bg-gray-400",
                      )}
                      style={{
                        width: `${
                          (stats.engagementBreakdown[level] /
                            stats.totalStudents) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Panel */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <button
            onClick={() => setIsInsightsExpanded(!isInsightsExpanded)}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Insights IA</h3>
              <p className="text-xs text-gray-500">
                Analyse pedagogique de votre cours
              </p>
            </div>
            {isInsightsExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          <Button
            onClick={generateInsights}
            disabled={isLoadingInsights || stats.totalStudents === 0}
            size="sm"
            className={cn(
              "gap-2",
              insights
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-violet-500 text-white hover:bg-violet-600",
            )}
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoadingInsights && "animate-spin")}
            />
            {isLoadingInsights
              ? "Analyse..."
              : insights
                ? "Actualiser"
                : "Generer l'analyse"}
          </Button>
        </div>

        {isInsightsExpanded && (
          <CardContent className="p-4">
            {insightsError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {insightsError}
              </div>
            )}

            {!insights && !insightsError && !isLoadingInsights && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="h-12 w-12 text-violet-200" />
                <p className="mt-4 text-sm text-gray-500">
                  {stats.totalStudents === 0
                    ? "Inscrivez des étudiants pour obtenir des insights"
                    : "Generez une analyse IA de votre cours"}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  L&apos;IA analysera les performances et vous donnera des
                  conseils
                </p>
              </div>
            )}

            {isLoadingInsights && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-violet-100" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 animate-pulse text-violet-500" />
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  Analyse en cours...
                </p>
              </div>
            )}

            {insights && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{insights.summary}</p>
                </div>

                {/* Insights */}
                {insights.insights.length > 0 && (
                  <div className="space-y-3">
                    {insights.insights.map((insight, index) => {
                      const style = insightStyles[insight.type];
                      const Icon = style.IconComponent;

                      return (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start gap-3 rounded-xl border p-4",
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
                            <p className="text-sm font-medium text-gray-900">
                              {insight.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-600">
                              {insight.description}
                            </p>
                            <p className="mt-2 text-xs font-medium text-gray-700">
                              Action: {insight.action}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Next Steps */}
                {insights.nextSteps.length > 0 && (
                  <div className="rounded-xl bg-violet-50 p-4">
                    <p className="text-sm font-medium text-violet-900 mb-2">
                      Prochaines etapes recommandees
                    </p>
                    <ul className="space-y-1">
                      {insights.nextSteps.map((step, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm text-violet-700"
                        >
                          <span className="font-medium">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Students List */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Étudiants inscrits ({students.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-200" />
              <p className="mt-4 text-gray-500">Aucun étudiant inscrit</p>
              <p className="mt-1 text-sm text-gray-400">
                Les étudiants apparaitront ici apres leur inscription
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-4 rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  {/* Avatar & Name */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={student.avatarUrl ?? undefined}
                      alt={student.firstName}
                    />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                      {student.firstName[0]}
                      {student.lastName?.[0] ?? ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {student.firstName} {student.lastName ?? ""}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {gradeLabels[student.gradeLevel] || student.gradeLevel}
                      </Badge>
                      <Badge
                        className={cn(
                          "text-xs border",
                          engagementColors[student.engagementLevel],
                        )}
                      >
                        {engagementLabels[student.engagementLevel]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(student.lastActivity)}
                      </span>
                      <span>Niveau {student.level}</span>
                      <span>{student.xp} XP</span>
                      {student.currentStreak > 0 && (
                        <span className="text-amber-500">
                          {student.currentStreak} jours
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="w-32 hidden sm:block">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-medium">
                        {student.progress.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={student.progress.percentage}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {student.progress.completedLessons}/
                      {student.progress.totalLessons} leçons
                    </p>
                  </div>

                  {/* Quiz Score */}
                  <div className="w-24 text-center hidden md:block">
                    <p className="text-xs text-gray-500">Score quiz</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        student.quizPerformance.averageScore === null
                          ? "text-gray-400"
                          : student.quizPerformance.averageScore >= 70
                            ? "text-emerald-600"
                            : student.quizPerformance.averageScore >= 50
                              ? "text-amber-600"
                              : "text-red-600",
                      )}
                    >
                      {student.quizPerformance.averageScore !== null
                        ? `${student.quizPerformance.averageScore}%`
                        : "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {student.quizPerformance.attemptCount} essais
                    </p>
                  </div>

                  {/* Time Spent */}
                  <div className="w-20 text-center hidden lg:block">
                    <p className="text-xs text-gray-500">Temps</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatTimeSpent(student.progress.totalTimeSpent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
