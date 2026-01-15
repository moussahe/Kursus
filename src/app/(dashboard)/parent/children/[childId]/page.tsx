import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpToNextLevel } from "@/lib/gamification";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/parent/progress-bar";
import { ChildFormDialog } from "@/components/parent/child-form-dialog";
import {
  XPProgress,
  StreakCounter,
  BadgeDisplay,
} from "@/components/gamification";
import { LearningPathCard } from "@/components/ai";

interface PageProps {
  params: Promise<{
    childId: string;
  }>;
}

const gradeLevelLabels: Record<string, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "Seconde",
  PREMIERE: "Premiere",
  TERMINALE: "Terminale",
};

async function getChildWithDetails(childId: string, userId: string) {
  const child = await prisma.child.findFirst({
    where: {
      id: childId,
      parentId: userId,
    },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        include: {
          course: {
            include: {
              author: {
                select: { name: true, image: true },
              },
              chapters: {
                where: { isPublished: true },
                include: {
                  lessons: {
                    where: { isPublished: true },
                    orderBy: { position: "asc" },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
      progress: {
        include: {
          lesson: {
            include: {
              chapter: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
        orderBy: { lastAccessedAt: "desc" },
      },
      badges: {
        include: { badge: true },
        orderBy: { earnedAt: "desc" },
      },
    },
  });

  if (!child) return null;

  // Calculate progress for each course
  const coursesWithProgress = child.purchases.map((purchase) => {
    const course = purchase.course;
    const totalLessons = course.chapters.reduce(
      (sum, ch) => sum + ch.lessons.length,
      0,
    );
    const completedLessons = child.progress.filter(
      (p) => p.isCompleted && p.lesson.chapter.courseId === course.id,
    ).length;
    const progress =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      ...course,
      totalLessons,
      completedLessons,
      progress,
    };
  });

  // Get recent activity
  const recentActivity = child.progress.slice(0, 5);

  // Calculate overall stats
  const totalLessonsAll = coursesWithProgress.reduce(
    (sum, c) => sum + c.totalLessons,
    0,
  );
  const completedLessonsAll = coursesWithProgress.reduce(
    (sum, c) => sum + c.completedLessons,
    0,
  );
  const overallProgress =
    totalLessonsAll > 0 ? (completedLessonsAll / totalLessonsAll) * 100 : 0;

  // Calculate XP progress
  const levelProgress = xpToNextLevel(child.xp);

  // Format badges for display
  const formattedBadges = child.badges.map((b) => ({
    code: b.badge.code,
    name: b.badge.name,
    description: b.badge.description,
    imageUrl: b.badge.imageUrl,
    category: b.badge.category,
    earnedAt: b.earnedAt,
  }));

  return {
    ...child,
    coursesWithProgress,
    recentActivity,
    stats: {
      totalCourses: coursesWithProgress.length,
      totalLessons: totalLessonsAll,
      completedLessons: completedLessonsAll,
      overallProgress,
    },
    gamification: {
      xp: child.xp,
      level: child.level,
      levelProgress,
      currentStreak: child.currentStreak,
      longestStreak: child.longestStreak,
      badges: formattedBadges,
    },
  };
}

function ChildDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function ChildDetail({
  childId,
  userId,
}: {
  childId: string;
  userId: string;
}) {
  const child = await getChildWithDetails(childId, userId);

  if (!child) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/parent/children">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </Button>

      {/* Child Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={child.avatarUrl ?? undefined}
                alt={child.firstName}
              />
              <AvatarFallback className="bg-emerald-100 text-2xl font-semibold text-emerald-600">
                {child.firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {child.firstName} {child.lastName}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-600"
                >
                  {gradeLevelLabels[child.gradeLevel]}
                </Badge>
                <span className="text-sm text-gray-500">
                  Membre depuis{" "}
                  {child.createdAt.toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <ChildFormDialog
            mode="edit"
            child={child}
            trigger={
              <Button variant="outline" className="gap-2">
                Modifier
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <BookOpen className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {child.stats.totalCourses}
              </p>
              <p className="text-sm text-gray-500">Cours inscrits</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <CheckCircle2 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {child.stats.completedLessons}/{child.stats.totalLessons}
              </p>
              <p className="text-sm text-gray-500">Leçons terminées</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(child.stats.overallProgress)}%
              </p>
              <p className="text-sm text-gray-500">Progression globale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <XPProgress
          xp={child.gamification.xp}
          level={child.gamification.level}
          progress={child.gamification.levelProgress.progress}
          current={child.gamification.levelProgress.current}
          needed={child.gamification.levelProgress.needed}
        />
        <StreakCounter
          currentStreak={child.gamification.currentStreak}
          longestStreak={child.gamification.longestStreak}
        />
        <BadgeDisplay badges={child.gamification.badges} maxVisible={4} />
      </div>

      {/* AI Learning Path */}
      <LearningPathCard childId={child.id} />

      {/* Courses Grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Cours Assignes
        </h2>
        {child.coursesWithProgress.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Aucun cours
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Achetez un cours et assignez-le a cet enfant.
            </p>
            <Button
              asChild
              className="mt-4 bg-emerald-500 hover:bg-emerald-600"
            >
              <Link href="/courses">Parcourir les cours</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {child.coursesWithProgress.map((course) => (
              <Link
                key={course.id}
                href={`/parent/courses/${course.id}?childId=${child.id}`}
                className="group rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex gap-4">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Par {course.author.name ?? "Anonyme"}
                    </p>
                    <div className="mt-3">
                      <ProgressBar value={course.progress} size="sm" />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {course.completedLessons}/{course.totalLessons} leçons
                    </p>
                  </div>
                </div>
                {course.progress === 100 && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                    <Trophy className="h-4 w-4" />
                    Cours termine !
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Activite Recente
        </h2>
        {child.recentActivity.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            Aucune activité recente.
          </p>
        ) : (
          <div className="space-y-4">
            {child.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-xl border border-gray-100 p-4"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    activity.isCompleted ? "bg-emerald-50" : "bg-blue-50",
                  )}
                >
                  {activity.isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Play className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.isCompleted ? "A termine" : "A commence"}{" "}
                    <span className="text-emerald-600">
                      {activity.lesson.title}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {activity.lesson.chapter.course.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(activity.lastAccessedAt)}
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

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "A l'instant";
  if (diffInSeconds < 3600)
    return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400)
    return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800)
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  return date.toLocaleDateString("fr-FR");
}

export default async function ChildDetailPage({ params }: PageProps) {
  const { childId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return (
    <Suspense fallback={<ChildDetailSkeleton />}>
      <ChildDetail childId={childId} userId={userId} />
    </Suspense>
  );
}
