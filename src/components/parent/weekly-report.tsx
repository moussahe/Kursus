"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./progress-bar";
import type { WeeklyStats } from "@/lib/services/alert-service";

interface WeeklyReportResponse {
  report: WeeklyStats[];
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
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

export function WeeklyReport() {
  const { data, isLoading, error } = useQuery<WeeklyReportResponse>({
    queryKey: ["weeklyReport"],
    queryFn: async () => {
      const res = await fetch("/api/parent/weekly-report");
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-gray-500">
            Impossible de charger le rapport hebdomadaire
          </p>
        </CardContent>
      </Card>
    );
  }

  const { report } = data;

  if (report.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500" />
            Rapport Hebdomadaire
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-sm text-gray-500">
            Aucune donnee disponible cette semaine
          </p>
        </CardContent>
      </Card>
    );
  }

  // Aggregate stats
  const totalLessons = report.reduce((sum, r) => sum + r.lessonsCompleted, 0);
  const totalTime = report.reduce((sum, r) => sum + r.totalTimeSpent, 0);
  const quizScores = report
    .filter((r) => r.averageQuizScore !== null)
    .map((r) => r.averageQuizScore as number);
  const overallAvg =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <BookOpen className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalLessons}
                </p>
                <p className="text-sm text-gray-500">Lecons cette semaine</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(totalTime)}
                </p>
                <p className="text-sm text-gray-500">Temps d&apos;etude</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
                <Target className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {overallAvg !== null ? `${overallAvg}%` : "-"}
                </p>
                <p className="text-sm text-gray-500">Moyenne quiz</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-child breakdown */}
      {report.map((childStats) => (
        <Card key={childStats.childId}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{childStats.childName}</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/parent/children/${childStats.childId}`}>
                  Voir profil <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Child stats */}
              <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900">
                    {childStats.lessonsCompleted}
                  </p>
                  <p className="text-xs text-gray-500">Lecons</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900">
                    {formatTime(childStats.totalTimeSpent)}
                  </p>
                  <p className="text-xs text-gray-500">Temps</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-900">
                    {childStats.averageQuizScore !== null
                      ? `${childStats.averageQuizScore}%`
                      : "-"}
                  </p>
                  <p className="text-xs text-gray-500">Quiz</p>
                </div>
              </div>

              {/* Course progress */}
              {childStats.coursesProgress.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Progression des cours
                  </h4>
                  {childStats.coursesProgress.map((course) => (
                    <div key={course.courseId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 truncate max-w-[200px]">
                          {course.courseTitle}
                        </span>
                        <span className="text-gray-500">
                          {course.lessonsThisWeek} lecons
                        </span>
                      </div>
                      <ProgressBar value={course.progressPercent} size="sm" />
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths & Areas to improve */}
              <div className="grid gap-4 sm:grid-cols-2">
                {childStats.strengths.length > 0 && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <h5 className="text-sm font-medium text-emerald-700">
                        Points forts
                      </h5>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {childStats.strengths.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                        >
                          {subjectLabels[subject] ?? subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {childStats.areasToImprove.length > 0 && (
                  <div className="rounded-lg border border-orange-100 bg-orange-50/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-orange-600" />
                      <h5 className="text-sm font-medium text-orange-700">
                        A ameliorer
                      </h5>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {childStats.areasToImprove.map((subject) => (
                        <span
                          key={subject}
                          className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-700"
                        >
                          {subjectLabels[subject] ?? subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {childStats.strengths.length === 0 &&
                childStats.areasToImprove.length === 0 && (
                  <p className="text-center text-sm text-gray-400 italic">
                    Plus de donnees necessaires pour analyser les forces et
                    faiblesses
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Achievement badge */}
      {totalLessons >= 5 && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
            <Award className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-900">Semaine productive !</p>
            <p className="text-sm text-amber-700">
              {totalLessons >= 10
                ? "Excellente semaine ! Continuez comme ca !"
                : "Belle progression cette semaine. Encore un effort !"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
