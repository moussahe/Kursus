"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Award,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  BookOpen,
  Flame,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentDetailModal } from "./student-detail-modal";

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

interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  subject: string;
  gradeLevel: string;
}

interface DashboardStats {
  totalStudents: number;
  studentsNeedingAttention: number;
  avgProgress: number;
  avgQuizScore: number | null;
  engagementBreakdown: {
    high: number;
    medium: number;
    low: number;
    inactive: number;
  };
  totalCourses: number;
}

const engagementColors = {
  high: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
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

function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours}h ${mins}min`;
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
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function StudentInsightsDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courses, setCourses] = useState<CourseInfo[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedEngagement, setSelectedEngagement] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("attention");

  // Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedCourse !== "all") params.set("courseId", selectedCourse);
      if (selectedEngagement !== "all")
        params.set("engagement", selectedEngagement);
      params.set("sortBy", sortBy);

      const response = await fetch(`/api/teacher/students?${params}`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des étudiants");
      }
      const data = await response.json();
      setStudents(data.students);
      setCourses(data.courses);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourse, selectedEngagement, sortBy]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.firstName.toLowerCase().includes(query) ||
      (student.lastName?.toLowerCase().includes(query) ?? false) ||
      (student.parentName?.toLowerCase().includes(query) ?? false)
    );
  });

  const handleStudentClick = (student: StudentData) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

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
                <p className="text-sm font-medium text-gray-500">
                  Total Étudiants
                </p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.totalCourses} cours
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "rounded-2xl border-0 shadow-sm",
            stats.studentsNeedingAttention > 0 ? "bg-red-50" : "bg-white",
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Besoin d&apos;attention
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    stats.studentsNeedingAttention > 0
                      ? "text-red-600"
                      : "text-gray-900",
                  )}
                >
                  {stats.studentsNeedingAttention}
                </p>
                <p className="text-xs text-gray-400 mt-1">élèves a risque</p>
              </div>
              <div
                className={cn(
                  "rounded-xl p-3",
                  stats.studentsNeedingAttention > 0
                    ? "bg-red-100"
                    : "bg-gray-100",
                )}
              >
                <AlertTriangle
                  className={cn(
                    "h-5 w-5",
                    stats.studentsNeedingAttention > 0
                      ? "text-red-500"
                      : "text-gray-400",
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Progression Moy.
                </p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
                <Progress value={stats.avgProgress} className="h-1.5 mt-2" />
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
                  Score Quiz Moy.
                </p>
                <p className="text-2xl font-bold">
                  {stats.avgQuizScore !== null ? `${stats.avgQuizScore}%` : "-"}
                </p>
                <p className="text-xs text-gray-400 mt-1">tous les quiz</p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <Award className="h-5 w-5 text-amber-500" />
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
                <button
                  key={level}
                  onClick={() =>
                    setSelectedEngagement(
                      selectedEngagement === level ? "all" : level,
                    )
                  }
                  className={cn(
                    "flex-1 rounded-xl p-3 transition-all",
                    selectedEngagement === level
                      ? "ring-2 ring-emerald-500 ring-offset-2"
                      : "hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {engagementLabels[level]}
                    </span>
                    <span className="text-sm font-bold">
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
                          stats.totalStudents > 0
                            ? (stats.engagementBreakdown[level] /
                                stats.totalStudents) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher un eleve..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>

          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="Tous les cours" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les cours</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="attention">Attention requise</SelectItem>
              <SelectItem value="lastActivity">Activite recente</SelectItem>
              <SelectItem value="progress">Progression</SelectItem>
              <SelectItem value="quizScore">Score quiz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={fetchStudents}
          variant="outline"
          size="sm"
          className="rounded-xl"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Students List */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Mes Étudiants ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-200" />
              <p className="mt-4 text-gray-500">
                {students.length === 0
                  ? "Aucun étudiant inscrit a vos cours"
                  : "Aucun resultat pour cette recherche"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => handleStudentClick(student)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl p-4 text-left transition-all",
                    student.needsAttention
                      ? "bg-red-50 hover:bg-red-100"
                      : "bg-gray-50 hover:bg-gray-100",
                  )}
                >
                  {/* Avatar & Name */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={student.avatarUrl ?? undefined}
                      alt={student.firstName}
                    />
                    <AvatarFallback
                      className={cn(
                        "font-medium",
                        student.needsAttention
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700",
                      )}
                    >
                      {student.firstName[0]}
                      {student.lastName?.[0] ?? ""}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {student.needsAttention && (
                        <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Attention
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeDate(student.lastActivityAt)}
                      </span>
                      <span>{student.courses.length} cours</span>
                      <span>Niveau {student.level}</span>
                      {student.currentStreak > 0 && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Flame className="h-3 w-3" />
                          {student.currentStreak} jours
                        </span>
                      )}
                    </div>
                    {student.attentionReasons.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {student.attentionReasons
                          .slice(0, 2)
                          .map((reason, i) => (
                            <span
                              key={i}
                              className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full"
                            >
                              {reason}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="w-28 hidden sm:block">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Progression</span>
                      <span className="font-medium">
                        {student.overallProgress}%
                      </span>
                    </div>
                    <Progress value={student.overallProgress} className="h-2" />
                  </div>

                  {/* Quiz Score */}
                  <div className="w-20 text-center hidden md:block">
                    <p className="text-xs text-gray-500">Quiz</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
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

                  {/* Time */}
                  <div className="w-20 text-center hidden lg:block">
                    <p className="text-xs text-gray-500">Temps</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatTimeSpent(student.totalTimeSpent)}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-violet-100 p-2 hidden sm:block">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}
