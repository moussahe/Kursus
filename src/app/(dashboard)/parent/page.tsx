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
import { AlertsPanel, type Alert } from "@/components/parent/alerts-panel";
import { AIInsightsPanel } from "@/components/parent/ai-insights-panel";
import { WeeklyReportCard } from "@/components/parent/weekly-report-card";
import { WeakAreasPanel } from "@/components/parent/weak-areas-panel";
import { CourseRecommendationsPanel } from "@/components/parent/course-recommendations-panel";
import { GoalsPanel } from "@/components/goals";

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

async function generateAlerts(userId: string): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get children with their recent activity and quiz results
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    include: {
      progress: {
        orderBy: { lastAccessedAt: "desc" },
        include: {
          lesson: {
            include: {
              chapter: { include: { course: true } },
            },
          },
        },
      },
      purchases: {
        where: { status: "COMPLETED" },
        include: { course: true },
      },
    },
  });

  for (const child of children) {
    const lastActivity = child.progress[0]?.lastAccessedAt;

    // Alert: Child hasn't studied in 3+ days
    if (!lastActivity || lastActivity < threeDaysAgo) {
      const daysSinceStudy = lastActivity
        ? Math.floor(
            (now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000),
          )
        : null;

      alerts.push({
        id: `inactivity-${child.id}`,
        type: "warning",
        title: daysSinceStudy
          ? `Inactif depuis ${daysSinceStudy} jours`
          : "Aucune activite",
        message: daysSinceStudy
          ? "Encouragez-le a reprendre ses cours !"
          : "N'a pas encore commence a etudier",
        childName: child.firstName,
        actionLabel: "Voir le profil",
        actionHref: `/parent/children/${child.id}`,
        createdAt: now,
      });
    }

    // Alert: Low quiz score (< 50%) - from progress records with quizScore
    const recentProgressWithQuiz = child.progress.filter(
      (p) => p.quizScore !== null && p.lastAccessedAt > sevenDaysAgo,
    );
    const lowScoreProgress = recentProgressWithQuiz.find(
      (p) => p.quizScore !== null && p.quizScore < 50,
    );
    if (lowScoreProgress) {
      alerts.push({
        id: `low-score-${child.id}-${lowScoreProgress.id}`,
        type: "warning",
        title: `Score faible en quiz (${lowScoreProgress.quizScore}%)`,
        message: `Besoin d'aide sur ${lowScoreProgress.lesson.chapter.course.title}`,
        childName: child.firstName,
        actionLabel: "Voir les details",
        actionHref: `/parent/children/${child.id}`,
        createdAt: lowScoreProgress.lastAccessedAt,
      });
    }

    // Alert: High quiz score (>= 90%) - Success!
    const highScoreProgress = recentProgressWithQuiz.find(
      (p) => p.quizScore !== null && p.quizScore >= 90,
    );
    if (highScoreProgress) {
      alerts.push({
        id: `high-score-${child.id}-${highScoreProgress.id}`,
        type: "success",
        title: `Excellent score (${highScoreProgress.quizScore}%) !`,
        message: `Bravo pour ${highScoreProgress.lesson.title}`,
        childName: child.firstName,
        createdAt: highScoreProgress.lastAccessedAt,
      });
    }

    // Alert: Course completion milestone
    for (const purchase of child.purchases) {
      const courseId = purchase.courseId;
      const [totalLessons, completedLessons] = await Promise.all([
        prisma.lesson.count({
          where: {
            chapter: { courseId, isPublished: true },
            isPublished: true,
          },
        }),
        prisma.progress.count({
          where: {
            childId: child.id,
            isCompleted: true,
            lesson: { chapter: { courseId } },
          },
        }),
      ]);

      if (totalLessons > 0) {
        const progressPercent = Math.round(
          (completedLessons / totalLessons) * 100,
        );

        // 50% milestone
        if (progressPercent >= 50 && progressPercent < 75) {
          alerts.push({
            id: `milestone-50-${child.id}-${courseId}`,
            type: "info",
            title: "Mi-parcours atteint !",
            message: `A termine 50% de ${purchase.course.title}`,
            childName: child.firstName,
            createdAt: now,
          });
        }

        // Course completed
        if (progressPercent === 100) {
          alerts.push({
            id: `completed-${child.id}-${courseId}`,
            type: "success",
            title: "Cours termine !",
            message: `A termine ${purchase.course.title}`,
            childName: child.firstName,
            actionLabel: "Voir le certificat",
            actionHref: `/parent/children/${child.id}`,
            createdAt: now,
          });
        }
      }
    }
  }

  // Sort by date (most recent first) and limit to 5
  return alerts
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
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

async function AlertsSection({ userId }: { userId: string }) {
  const alerts = await generateAlerts(userId);

  if (alerts.length === 0) {
    return null;
  }

  return <AlertsPanel alerts={alerts} />;
}

function QuickLinks() {
  const links = [
    {
      title: "Parcourir les cours",
      description: "Decouvrez notre catalogue",
      href: "/courses" as const,
      icon: BookOpen,
      color: "emerald" as const,
    },
    {
      title: "Ajouter un enfant",
      description: "Creez un profil enfant",
      href: "/parent/children" as const,
      icon: Users,
      color: "purple" as const,
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

async function AIInsightsSection({ userId }: { userId: string }) {
  // Get children for this parent
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    select: { id: true, firstName: true },
  });

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Analyse IA Personnalisee
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {children.map((child) => (
          <AIInsightsPanel
            key={child.id}
            childId={child.id}
            childName={child.firstName}
          />
        ))}
      </div>
    </div>
  );
}

async function WeeklyReportsSection({ userId }: { userId: string }) {
  // Get children for this parent
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    select: { id: true, firstName: true },
  });

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Rapports Hebdomadaires
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {children.map((child) => (
          <WeeklyReportCard
            key={child.id}
            childId={child.id}
            childName={child.firstName}
          />
        ))}
      </div>
    </div>
  );
}

async function WeakAreasSection({ userId }: { userId: string }) {
  // Get children for this parent
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    select: { id: true, firstName: true },
  });

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Points a Ameliorer
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {children.map((child) => (
          <WeakAreasPanel
            key={child.id}
            childId={child.id}
            childName={child.firstName}
          />
        ))}
      </div>
    </div>
  );
}

async function CourseRecommendationsSection({ userId }: { userId: string }) {
  // Get children for this parent
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    select: { id: true, firstName: true },
  });

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Cours Recommandes</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {children.map((child) => (
          <CourseRecommendationsPanel
            key={child.id}
            childId={child.id}
            childName={child.firstName}
          />
        ))}
      </div>
    </div>
  );
}

async function StudyGoalsSection({ userId }: { userId: string }) {
  // Get children for this parent
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    select: { id: true, firstName: true },
  });

  if (children.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Objectifs d&apos;Etude
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {children.map((child) => (
          <GoalsPanel
            key={child.id}
            childId={child.id}
            childName={child.firstName}
          />
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

      {/* Alerts */}
      <Suspense fallback={null}>
        <AlertsSection userId={userId} />
      </Suspense>

      {/* AI Insights */}
      <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
        <AIInsightsSection userId={userId} />
      </Suspense>

      {/* Weekly Reports */}
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <WeeklyReportsSection userId={userId} />
      </Suspense>

      {/* Weak Areas */}
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <WeakAreasSection userId={userId} />
      </Suspense>

      {/* Course Recommendations */}
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <CourseRecommendationsSection userId={userId} />
      </Suspense>

      {/* Study Goals */}
      <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
        <StudyGoalsSection userId={userId} />
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
