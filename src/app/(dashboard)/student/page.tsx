import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpToNextLevel, XP_REWARDS } from "@/lib/gamification";
import {
  BookOpen,
  Play,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  MessageSquare,
  Award,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  XPProgress,
  StreakCounter,
  BadgeDisplay,
  LeaderboardCard,
  DailyChallengeCard,
} from "@/components/gamification";
import { StudyGoalCard } from "@/components/goals";

async function getStudentData(childId: string) {
  const [child, recentProgress, purchases] = await Promise.all([
    prisma.child.findUnique({
      where: { id: childId },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: "desc" },
          take: 8,
        },
      },
    }),
    prisma.progress.findMany({
      where: { childId },
      include: {
        lesson: {
          include: {
            chapter: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: 5,
    }),
    prisma.purchase.findMany({
      where: { childId, status: "COMPLETED" },
      include: {
        course: {
          include: {
            chapters: {
              where: { isPublished: true },
              include: {
                lessons: {
                  where: { isPublished: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!child) return null;

  // Calculate course progress
  const coursesWithProgress = await Promise.all(
    purchases.map(async (purchase) => {
      const course = purchase.course;
      const totalLessons = course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0,
      );
      const completedLessons = await prisma.progress.count({
        where: {
          childId,
          isCompleted: true,
          lesson: { chapter: { courseId: course.id } },
        },
      });

      // Find next lesson to continue
      let nextLesson = null;
      for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
          const progress = await prisma.progress.findUnique({
            where: { childId_lessonId: { childId, lessonId: lesson.id } },
          });
          if (!progress?.isCompleted) {
            nextLesson = {
              id: lesson.id,
              title: lesson.title,
              chapterTitle: chapter.title,
            };
            break;
          }
        }
        if (nextLesson) break;
      }

      return {
        ...course,
        totalLessons,
        completedLessons,
        progress:
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        nextLesson,
      };
    }),
  );

  // Get level progress
  const levelProgress = xpToNextLevel(child.xp);

  // Format badges
  const badges = child.badges.map((b) => ({
    code: b.badge.code,
    name: b.badge.name,
    description: b.badge.description,
    imageUrl: b.badge.imageUrl,
    category: b.badge.category,
    earnedAt: b.earnedAt,
  }));

  // Calculate stats
  const totalLessonsCompleted = coursesWithProgress.reduce(
    (sum, c) => sum + c.completedLessons,
    0,
  );
  const totalLessons = coursesWithProgress.reduce(
    (sum, c) => sum + c.totalLessons,
    0,
  );

  return {
    child,
    levelProgress,
    badges,
    coursesWithProgress,
    recentProgress,
    stats: {
      totalCourses: coursesWithProgress.length,
      totalLessonsCompleted,
      totalLessons,
      overallProgress:
        totalLessons > 0 ? (totalLessonsCompleted / totalLessons) * 100 : 0,
    },
  };
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

async function StudentDashboard({ childId }: { childId: string }) {
  const data = await getStudentData(childId);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">Erreur de chargement des donnees.</p>
      </div>
    );
  }

  const {
    child,
    levelProgress,
    badges,
    coursesWithProgress,
    recentProgress,
    stats,
  } = data;

  // Get course to continue (most recently accessed or first incomplete)
  const courseToContine = coursesWithProgress.find(
    (c) => c.progress < 100 && c.nextLesson,
  );

  // Motivational message based on streak
  const getMotivationalMessage = () => {
    if (child.currentStreak >= 7) {
      return `${child.currentStreak} jours d'affilee ! Tu es incroyable !`;
    } else if (child.currentStreak >= 3) {
      return `Super serie de ${child.currentStreak} jours ! Continue comme ca !`;
    } else if (child.currentStreak === 1) {
      return "Belle journee pour apprendre quelque chose de nouveau !";
    }
    return "Pret a apprendre quelque chose de nouveau aujourd'hui ?";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header with motivational message */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Salut, {child.firstName} !
          </h1>
          <p className="mt-1 text-gray-500">{getMotivationalMessage()}</p>
        </div>
        {child.currentStreak >= 3 && (
          <div className="flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700">
            <TrendingUp className="h-4 w-4" />
            En feu !
          </div>
        )}
      </div>

      {/* Continue Learning CTA */}
      {courseToContine && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="relative z-10">
            <p className="text-sm font-medium text-violet-100">Continuer</p>
            <h2 className="mt-1 text-xl font-bold">{courseToContine.title}</h2>
            <p className="mt-2 text-sm text-violet-100">
              {courseToContine.nextLesson?.chapterTitle} -{" "}
              {courseToContine.nextLesson?.title}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <Button
                asChild
                className="bg-white text-violet-600 hover:bg-violet-50"
              >
                <Link
                  href={`/student/courses/${courseToContine.id}/lessons/${courseToContine.nextLesson?.id}`}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Continuer
                </Link>
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${courseToContine.progress}%` }}
                  />
                </div>
                <span>{Math.round(courseToContine.progress)}%</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -right-16 h-32 w-32 rounded-full bg-white/5" />
        </div>
      )}

      {/* Daily Challenges - Featured prominently */}
      <DailyChallengeCard childId={child.id} />

      {/* Gamification Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <XPProgress
          xp={child.xp}
          level={child.level}
          progress={levelProgress.progress}
          current={levelProgress.current}
          needed={levelProgress.needed}
        />
        <StreakCounter
          currentStreak={child.currentStreak}
          longestStreak={child.longestStreak}
        />
        <BadgeDisplay badges={badges} maxVisible={4} />
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <BookOpen className="h-6 w-6 text-violet-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalCourses}
            </p>
            <p className="text-sm text-gray-500">Cours</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalLessonsCompleted}
            </p>
            <p className="text-sm text-gray-500">Lecons terminees</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
            <Zap className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {child.xp.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">XP total</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(stats.overallProgress)}%
            </p>
            <p className="text-sm text-gray-500">Progression</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Courses */}
        <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Mes Cours</h2>
            <Link
              href="/student/courses"
              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {coursesWithProgress.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">
                Aucun cours pour le moment.
              </p>
              <p className="text-xs text-gray-400">
                Demande a tes parents d&apos;en acheter un !
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {coursesWithProgress.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  href={`/student/courses/${course.id}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 p-3 transition-colors hover:bg-gray-50"
                >
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {course.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {Math.round(course.progress)}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {course.completedLessons}/{course.totalLessons} lecons
                    </p>
                  </div>
                  {course.progress === 100 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ArrowRight className="h-5 w-5 text-gray-300" />
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <LeaderboardCard
          childId={child.id}
          gradeLevel={child.gradeLevel}
          compact
        />
      </div>

      {/* Study Goals */}
      <StudyGoalCard childId={child.id} />

      {/* Activity and Leaderboard Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Activite Recente
          </h2>
          {recentProgress.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-12 w-12 text-gray-300" />
              <p className="mt-4 text-sm text-gray-500">
                Aucune activite recente.
              </p>
              <p className="text-xs text-gray-400">
                Commence une lecon pour voir ton activite !
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentProgress.map((progress) => (
                <div
                  key={progress.id}
                  className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      progress.isCompleted ? "bg-emerald-100" : "bg-violet-100",
                    )}
                  >
                    {progress.isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Play className="h-4 w-4 text-violet-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {progress.lesson.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {progress.lesson.chapter.course.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {progress.isCompleted && (
                        <span className="flex items-center gap-1 text-xs text-emerald-600">
                          <Zap className="h-3 w-3" />+
                          {XP_REWARDS.LESSON_COMPLETED} XP
                        </span>
                      )}
                      {progress.quizScore !== null && (
                        <span className="text-xs text-gray-400">
                          Quiz: {progress.quizScore}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Spaced Repetition CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Revision Intelligente</h3>
              <p className="text-sm text-violet-100">
                Revise tes points faibles avec la methode scientifique SM-2
              </p>
            </div>
          </div>
          <Button
            asChild
            className="bg-white text-violet-600 hover:bg-violet-50"
          >
            <Link href="/student/revision">
              <Brain className="mr-2 h-4 w-4" />
              Reviser
            </Link>
          </Button>
        </div>
      </div>

      {/* Exam Mode CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Mode Revision Examen</h3>
              <p className="text-sm text-amber-100">
                Entraine-toi dans les conditions reelles du Brevet ou du Bac
              </p>
            </div>
          </div>
          <Button asChild className="bg-white text-amber-600 hover:bg-amber-50">
            <Link href="/student/exam-mode">
              <Award className="mr-2 h-4 w-4" />
              Commencer
            </Link>
          </Button>
        </div>
      </div>

      {/* AI Tutor CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold">Besoin d&apos;aide ?</h3>
              <p className="text-sm text-blue-100">
                L&apos;assistant IA est la pour t&apos;aider avec tes cours
              </p>
            </div>
          </div>
          <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
            <Link href="/student/ai-tutor">
              <MessageSquare className="mr-2 h-4 w-4" />
              Poser une question
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default async function StudentDashboardPage() {
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
    <Suspense fallback={<DashboardSkeleton />}>
      <StudentDashboard childId={childId} />
    </Suspense>
  );
}
