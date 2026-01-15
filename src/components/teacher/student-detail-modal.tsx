"use client";

import { useState, useCallback } from "react";
import {
  X,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  MessageSquare,
  Copy,
  Check,
  TrendingUp,
  Flame,
  Award,
  Clock,
  Mail,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseEnrollment {
  id: string;
  title: string;
  slug: string;
  subject: string;
  enrolledAt: string;
  progress: number;
  quizScore: number | null;
}

interface WeakArea {
  subject: string;
  topic: string;
  difficulty: string | null;
}

interface StudentData {
  id: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  gradeLevel: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: string | null;
  parentName: string | null;
  parentEmail: string | null;
  courses: CourseEnrollment[];
  weakAreas: WeakArea[];
  overallProgress: number;
  avgQuizScore: number | null;
  totalTimeSpent: number;
  engagementLevel: "high" | "medium" | "low" | "inactive";
  needsAttention: boolean;
  attentionReasons: string[];
}

interface Recommendation {
  type: "action" | "content" | "communication";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionable: string;
}

interface InsightsData {
  childId: string;
  childName: string;
  parentName: string | null;
  insights: {
    summary: string;
    strengths: string[];
    challenges: string[];
    recommendations: Recommendation[];
    parentMessage: {
      tone: "encouragement" | "alert" | "celebration";
      subject: string;
      body: string;
    };
    riskLevel: "low" | "medium" | "high";
    riskFactors: string[];
  };
  rawMetrics: {
    progressPercent: number;
    avgQuizScore: number | null;
    totalTimeSpent: number;
    currentStreak: number;
    weakAreasCount: number;
  };
}

interface StudentDetailModalProps {
  student: StudentData;
  isOpen: boolean;
  onClose: () => void;
}

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
  TERMINALE: "Terminale",
};

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

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

const difficultyColors: Record<string, string> = {
  hard: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  easy: "bg-blue-100 text-blue-700",
};

const riskColors = {
  low: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}min`;
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

function InsightsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
}: StudentDetailModalProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const generateInsights = useCallback(async () => {
    try {
      setIsLoadingInsights(true);
      setInsightsError(null);
      const response = await fetch(
        `/api/teacher/students/${student.id}/insights`,
        { method: "POST" },
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
  }, [student.id]);

  const copyParentMessage = async () => {
    if (!insights) return;
    const fullMessage = `Objet: ${insights.insights.parentMessage.subject}\n\n${insights.insights.parentMessage.body}`;
    await navigator.clipboard.writeText(fullMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={student.avatarUrl ?? undefined}
                  alt={student.firstName}
                />
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg font-medium">
                  {student.firstName[0]}
                  {student.lastName?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {student.firstName} {student.lastName ?? ""}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">
                    {gradeLabels[student.gradeLevel] || student.gradeLevel}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Niveau {student.level} - {student.xp} XP
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full justify-start rounded-xl bg-gray-100 p-1">
            <TabsTrigger value="overview" className="rounded-lg">
              Apercu
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg">
              Cours ({student.courses.length})
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="rounded-lg flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Insights IA
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Progression
                </div>
                <p className="text-2xl font-bold">{student.overallProgress}%</p>
                <Progress
                  value={student.overallProgress}
                  className="h-1.5 mt-2"
                />
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Award className="h-4 w-4" />
                  Score Quiz
                </div>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    student.avgQuizScore === null
                      ? "text-gray-400"
                      : student.avgQuizScore >= 70
                        ? "text-emerald-600"
                        : student.avgQuizScore >= 50
                          ? "text-amber-600"
                          : "text-red-600",
                  )}
                >
                  {student.avgQuizScore !== null
                    ? `${student.avgQuizScore}%`
                    : "-"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Flame className="h-4 w-4" />
                  Serie
                </div>
                <p className="text-2xl font-bold text-amber-600">
                  {student.currentStreak} jours
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Record: {student.longestStreak}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  Temps
                </div>
                <p className="text-2xl font-bold">
                  {formatTimeSpent(student.totalTimeSpent)}
                </p>
              </div>
            </div>

            {/* Parent Info */}
            {student.parentName && (
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-2">Parent</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-700">{student.parentName}</p>
                    {student.parentEmail && (
                      <p className="text-sm text-gray-500">
                        {student.parentEmail}
                      </p>
                    )}
                  </div>
                  {student.parentEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      asChild
                    >
                      <a href={`mailto:${student.parentEmail}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Contacter
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Attention Reasons */}
            {student.needsAttention && student.attentionReasons.length > 0 && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Points d&apos;attention
                </h4>
                <ul className="space-y-1">
                  {student.attentionReasons.map((reason, i) => (
                    <li
                      key={i}
                      className="text-sm text-red-700 flex items-center gap-2"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weak Areas */}
            {student.weakAreas.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Points faibles detectes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {student.weakAreas.map((area, i) => (
                    <Badge
                      key={i}
                      className={cn(
                        "text-xs",
                        difficultyColors[area.difficulty ?? "easy"] ||
                          difficultyColors.easy,
                      )}
                    >
                      {subjectLabels[area.subject] || area.subject}:{" "}
                      {area.topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="mt-4 space-y-3">
            {student.courses.map((course) => (
              <div
                key={course.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {course.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {subjectLabels[course.subject] || course.subject} -
                      Inscrit le {formatDate(course.enrolledAt)}
                    </p>
                  </div>
                  <Badge variant="outline">{course.progress}%</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Progression</p>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Score Quiz</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        course.quizScore === null
                          ? "text-gray-400"
                          : course.quizScore >= 70
                            ? "text-emerald-600"
                            : course.quizScore >= 50
                              ? "text-amber-600"
                              : "text-red-600",
                      )}
                    >
                      {course.quizScore !== null ? `${course.quizScore}%` : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="mt-4 space-y-4">
            {!insights && !isLoadingInsights && !insightsError && (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-violet-50 border border-violet-200">
                <div className="relative mb-4">
                  <div className="h-16 w-16 rounded-full bg-violet-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-violet-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-violet-900">
                  Analyse IA de {student.firstName}
                </h3>
                <p className="text-sm text-violet-700 mt-2 max-w-md">
                  Obtenez des recommandations personnalisees et un message
                  suggere pour le parent base sur les donnees de progression.
                </p>
                <Button
                  onClick={generateInsights}
                  className="mt-6 bg-violet-500 hover:bg-violet-600 rounded-xl"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generer l&apos;analyse
                </Button>
              </div>
            )}

            {insightsError && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <p className="text-red-700">{insightsError}</p>
                <Button
                  onClick={generateInsights}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Reessayer
                </Button>
              </div>
            )}

            {isLoadingInsights && <InsightsLoadingSkeleton />}

            {insights && (
              <div className="space-y-4">
                {/* Risk Level */}
                <div
                  className={cn(
                    "rounded-xl border p-4",
                    riskColors[insights.insights.riskLevel].bg,
                    riskColors[insights.insights.riskLevel].border,
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className={cn(
                        "font-medium",
                        riskColors[insights.insights.riskLevel].text,
                      )}
                    >
                      Niveau de risque:{" "}
                      {insights.insights.riskLevel === "low"
                        ? "Faible"
                        : insights.insights.riskLevel === "medium"
                          ? "Moyen"
                          : "Élève"}
                    </h4>
                    <Button
                      onClick={generateInsights}
                      variant="ghost"
                      size="sm"
                      disabled={isLoadingInsights}
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          isLoadingInsights && "animate-spin",
                        )}
                      />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">
                    {insights.insights.summary}
                  </p>
                </div>

                {/* Strengths & Challenges */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <h4 className="font-medium text-emerald-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Forces
                    </h4>
                    <ul className="space-y-1">
                      {insights.insights.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-emerald-700 flex items-start gap-2"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Defis
                    </h4>
                    <ul className="space-y-1">
                      {insights.insights.challenges.map((c, i) => (
                        <li
                          key={i}
                          className="text-sm text-amber-700 flex items-start gap-2"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                {insights.insights.recommendations.length > 0 && (
                  <div className="rounded-xl border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Recommandations
                    </h4>
                    <div className="space-y-3">
                      {insights.insights.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="rounded-lg bg-gray-50 p-3 border border-gray-100"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={cn(
                                "text-xs",
                                priorityColors[rec.priority],
                              )}
                            >
                              {rec.priority === "high"
                                ? "Prioritaire"
                                : rec.priority === "medium"
                                  ? "Important"
                                  : "Suggestion"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {rec.type === "action"
                                ? "Action"
                                : rec.type === "content"
                                  ? "Contenu"
                                  : "Communication"}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">
                            {rec.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {rec.description}
                          </p>
                          <p className="text-sm text-emerald-700 mt-2 font-medium">
                            {rec.actionable}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Parent Message */}
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Message suggere pour le parent
                    </h4>
                    <Button
                      onClick={copyParentMessage}
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-emerald-500" />
                          Copie!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copier
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-blue-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Objet: {insights.insights.parentMessage.subject}
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">
                      {insights.insights.parentMessage.body}
                    </p>
                  </div>
                  {student.parentEmail && (
                    <Button
                      asChild
                      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 rounded-lg"
                    >
                      <a
                        href={`mailto:${student.parentEmail}?subject=${encodeURIComponent(insights.insights.parentMessage.subject)}&body=${encodeURIComponent(insights.insights.parentMessage.body)}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer par email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
