import { Suspense } from "react";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

function formatTimeSpent(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  if (secs === 0) {
    return `${mins}min`;
  }
  return `${mins}min ${secs}s`;
}

interface QuizAttemptData {
  id: string;
  quizId: string;
  lessonId: string;
  percentage: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: Date;
  aiFeedback: string | null;
  quiz: {
    title: string;
    passingScore: number;
  };
  lesson: {
    title: string;
    chapter: {
      title: string;
      course: {
        id: string;
        title: string;
        subject: string;
      };
    };
  };
}

async function getQuizHistory(childId: string) {
  const [attempts, stats] = await Promise.all([
    prisma.quizAttempt.findMany({
      where: { childId },
      include: {
        quiz: {
          select: {
            title: true,
            passingScore: true,
          },
        },
        lesson: {
          select: {
            title: true,
            chapter: {
              select: {
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    subject: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
      take: 50,
    }),
    prisma.quizAttempt.aggregate({
      where: { childId },
      _count: true,
      _avg: { percentage: true },
    }),
  ]);

  const passedCount = await prisma.quizAttempt.count({
    where: { childId, passed: true },
  });

  return {
    attempts,
    stats: {
      totalAttempts: stats._count,
      averageScore: Math.round(stats._avg.percentage ?? 0),
      passedAttempts: passedCount,
      passRate:
        stats._count > 0 ? Math.round((passedCount / stats._count) * 100) : 0,
    },
  };
}

function QuizHistorySkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

function getSubjectLabel(subject: string): string {
  const labels: Record<string, string> = {
    MATHEMATIQUES: "Maths",
    FRANCAIS: "Francais",
    HISTOIRE_GEO: "Histoire-Geo",
    SCIENCES: "Sciences",
    ANGLAIS: "Anglais",
    PHYSIQUE_CHIMIE: "Physique-Chimie",
    SVT: "SVT",
    PHILOSOPHIE: "Philo",
    ESPAGNOL: "Espagnol",
    ALLEMAND: "Allemand",
    SES: "SES",
    NSI: "NSI",
  };
  return labels[subject] ?? subject;
}

function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    MATHEMATIQUES: "bg-blue-100 text-blue-700",
    FRANCAIS: "bg-purple-100 text-purple-700",
    HISTOIRE_GEO: "bg-amber-100 text-amber-700",
    SCIENCES: "bg-green-100 text-green-700",
    ANGLAIS: "bg-red-100 text-red-700",
    PHYSIQUE_CHIMIE: "bg-cyan-100 text-cyan-700",
    SVT: "bg-emerald-100 text-emerald-700",
    PHILOSOPHIE: "bg-pink-100 text-pink-700",
    ESPAGNOL: "bg-orange-100 text-orange-700",
    ALLEMAND: "bg-slate-100 text-slate-700",
    SES: "bg-indigo-100 text-indigo-700",
    NSI: "bg-violet-100 text-violet-700",
  };
  return colors[subject] ?? "bg-gray-100 text-gray-700";
}

async function QuizHistoryContent({ childId }: { childId: string }) {
  const { attempts, stats } = await getQuizHistory(childId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Historique des Quiz
        </h1>
        <p className="mt-1 text-gray-500">
          Retrouve tous tes resultats de quiz
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <ClipboardList className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalAttempts}
            </p>
            <p className="text-sm text-gray-500">Quiz passes</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.passedAttempts}
            </p>
            <p className="text-sm text-gray-500">Reussis</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.averageScore}%
            </p>
            <p className="text-sm text-gray-500">Moyenne</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
            <Trophy className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.passRate}%
            </p>
            <p className="text-sm text-gray-500">Taux réussite</p>
          </div>
        </div>
      </div>

      {/* Quiz History List */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Resultats recents
        </h2>

        {attempts.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-16 w-16 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">
              Aucun quiz termine
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Complete des quiz dans tes cours pour voir ton historique ici !
            </p>
            <Link
              href="/student/courses"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
            >
              <BookOpen className="h-4 w-4" />
              Voir mes cours
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {(attempts as QuizAttemptData[]).map((attempt) => (
              <div
                key={attempt.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center"
              >
                {/* Status Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    attempt.passed ? "bg-emerald-100" : "bg-red-100",
                  )}
                >
                  {attempt.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>

                {/* Quiz Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 truncate">
                      {attempt.quiz.title}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        getSubjectColor(attempt.lesson.chapter.course.subject),
                      )}
                    >
                      {getSubjectLabel(attempt.lesson.chapter.course.subject)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 truncate">
                    {attempt.lesson.chapter.course.title} -{" "}
                    {attempt.lesson.title}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeSpent(attempt.timeSpent)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {attempt.correctCount}/{attempt.totalQuestions} bonnes
                      réponses
                    </span>
                    <span>
                      {new Date(attempt.completedAt).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-4 sm:ml-auto">
                  <div className="text-right">
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        attempt.passed ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {attempt.percentage}%
                    </p>
                    <p className="text-xs text-gray-400">
                      Seuil: {attempt.quiz.passingScore}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function QuizHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  // Get selected child from cookie
  const cookieStore = await cookies();
  const selectedChildId = cookieStore.get("selectedChildId")?.value;

  // Get first child if no selection
  let childId = selectedChildId;
  if (!childId) {
    const firstChild = await prisma.child.findFirst({
      where: { parentId: session.user.id },
      select: { id: true },
    });
    childId = firstChild?.id;
  }

  if (!childId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">Aucun enfant trouve.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<QuizHistorySkeleton />}>
      <QuizHistoryContent childId={childId} />
    </Suspense>
  );
}
