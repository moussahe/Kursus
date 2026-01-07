import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BookOpen,
  Users,
  TrendingUp,
  CreditCard,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/parent/progress-bar";

async function getParentStats(userId: string) {
  const [children, purchases, recentProgress] = await Promise.all([
    // Get children with their progress
    prisma.child.findMany({
      where: { parentId: userId },
      include: {
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
          take: 5,
        },
        purchases: {
          where: { status: "COMPLETED" },
          include: {
            course: true,
          },
        },
      },
    }),
    // Get purchases this month
    prisma.purchase.findMany({
      where: {
        userId,
        status: "COMPLETED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    // Get recent activity
    prisma.progress.findMany({
      where: {
        child: {
          parentId: userId,
        },
      },
      include: {
        child: true,
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
      take: 10,
    }),
  ]);

  // Calculate total courses
  const totalCourses = new Set(
    children.flatMap((child) => child.purchases.map((p) => p.courseId)),
  ).size;

  // Calculate average progress
  let totalProgress = 0;
  let progressCount = 0;
  for (const child of children) {
    for (const purchase of child.purchases) {
      const courseId = purchase.courseId;
      const courseLessons = await prisma.lesson.count({
        where: {
          chapter: {
            courseId,
            isPublished: true,
          },
          isPublished: true,
        },
      });
      const completedLessons = child.progress.filter(
        (p) => p.isCompleted && p.lesson.chapter.courseId === courseId,
      ).length;
      if (courseLessons > 0) {
        totalProgress += (completedLessons / courseLessons) * 100;
        progressCount++;
      }
    }
  }
  const averageProgress =
    progressCount > 0 ? Math.round(totalProgress / progressCount) : 0;

  // Calculate monthly spending
  const monthlySpent = purchases.reduce((sum, p) => sum + p.amount, 0) / 100;

  return {
    totalCourses,
    childrenCount: children.length,
    averageProgress,
    monthlySpent,
    recentActivity: recentProgress.slice(0, 5),
    children,
  };
}

function StatsCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="mt-4 h-8 w-24" />
      <Skeleton className="mt-2 h-4 w-32" />
    </div>
  );
}

async function StatsCards({ userId }: { userId: string }) {
  const stats = await getParentStats(userId);

  const cards = [
    {
      title: "Cours Actifs",
      value: stats.totalCourses.toString(),
      description: "Cours en cours",
      icon: BookOpen,
      color: "emerald",
    },
    {
      title: "Progression Moyenne",
      value: `${stats.averageProgress}%`,
      description: "Tous les enfants",
      icon: TrendingUp,
      color: "blue",
    },
    {
      title: "Enfants",
      value: stats.childrenCount.toString(),
      description: "Comptes enfants",
      icon: Users,
      color: "purple",
    },
    {
      title: "Depenses du Mois",
      value: `${stats.monthlySpent.toFixed(2)} EUR`,
      description: "Ce mois-ci",
      icon: CreditCard,
      color: "orange",
    },
  ];

  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-500",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-500",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-500",
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const colors = colorClasses[card.color as keyof typeof colorClasses];
        return (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={cn("inline-flex rounded-xl p-3", colors.bg)}>
              <card.icon className={cn("h-6 w-6", colors.icon)} />
            </div>
            <p className="mt-4 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-gray-500">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}

async function RecentActivity({ userId }: { userId: string }) {
  const stats = await getParentStats(userId);

  if (stats.recentActivity.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Activite Recente
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Clock className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">
            Aucune activite recente. Commencez par ajouter un enfant et acheter
            un cours !
          </p>
          <Button asChild className="mt-4 bg-emerald-500 hover:bg-emerald-600">
            <Link href="/courses">Parcourir les cours</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Activite Recente
        </h2>
        <Link
          href="/parent/children"
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
        >
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {stats.recentActivity.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 rounded-xl border border-gray-100 p-4"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                activity.isCompleted ? "bg-emerald-50" : "bg-gray-50",
              )}
            >
              {activity.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {activity.child.firstName} a{" "}
                {activity.isCompleted ? "termine" : "commence"}{" "}
                <span className="text-emerald-600">
                  {activity.lesson.title}
                </span>
              </p>
              <p className="mt-1 text-xs text-gray-500 truncate">
                {activity.lesson.chapter.course.title}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {formatRelativeTime(activity.lastAccessedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function ChildrenProgress({ userId }: { userId: string }) {
  const stats = await getParentStats(userId);

  if (stats.children.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Progression des Enfants
        </h2>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <Users className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">
            Ajoutez votre premier enfant pour commencer !
          </p>
          <Button asChild className="mt-4 bg-emerald-500 hover:bg-emerald-600">
            <Link href="/parent/children">Ajouter un enfant</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Progression des Enfants
        </h2>
        <Link
          href="/parent/children"
          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
        >
          Voir tout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-6 space-y-4">
        {stats.children.map((child) => {
          // Calculate progress for this child
          const coursesCount = child.purchases.length;
          let totalProgress = 0;

          if (coursesCount > 0) {
            child.purchases.forEach((purchase) => {
              const completedLessons = child.progress.filter(
                (p) =>
                  p.isCompleted &&
                  p.lesson.chapter.courseId === purchase.courseId,
              ).length;
              // Simplified progress calculation
              totalProgress += completedLessons > 0 ? completedLessons * 10 : 0;
            });
            totalProgress = Math.min(100, totalProgress);
          }

          return (
            <Link
              key={child.id}
              href={`/parent/children/${child.id}`}
              className="block rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-600">
                  {child.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {child.firstName}
                    </p>
                    <span className="text-xs text-gray-500">
                      {coursesCount} cours
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatGradeLevel(child.gradeLevel)}
                  </p>
                  <div className="mt-2">
                    <ProgressBar value={totalProgress} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function QuickLinks() {
  const links = [
    {
      title: "Parcourir les cours",
      description: "Decouvrez notre catalogue",
      href: "/courses",
      icon: BookOpen,
      color: "emerald",
    },
    {
      title: "Ajouter un enfant",
      description: "Creez un profil enfant",
      href: "/parent/children",
      icon: Users,
      color: "purple",
    },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Actions Rapides</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                link.color === "emerald" ? "bg-emerald-50" : "bg-purple-50",
              )}
            >
              <link.icon
                className={cn(
                  "h-5 w-5",
                  link.color === "emerald"
                    ? "text-emerald-500"
                    : "text-purple-500",
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{link.title}</p>
              <p className="text-xs text-gray-500">{link.description}</p>
            </div>
          </Link>
        ))}
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

function formatGradeLevel(level: string): string {
  const levels: Record<string, string> = {
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
  return levels[level] || level;
}

export default async function ParentDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {session.user.name?.split(" ")[0] ?? "Parent"} !
        </h1>
        <p className="mt-1 text-gray-500">
          Voici un apercu de l&apos;activite de vos enfants.
        </p>
      </div>

      {/* Stats */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StatsCards userId={userId} />
      </Suspense>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <RecentActivity userId={userId} />
          </Suspense>
          <QuickLinks />
        </div>

        {/* Right Column */}
        <div>
          <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
            <ChildrenProgress userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
