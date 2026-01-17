import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Star,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard | Kursus",
  description: "Tableau de bord d'administration Kursus",
};

async function getAdminStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalTeachers,
    totalChildren,
    totalCourses,
    publishedCourses,
    draftCourses,
    totalPurchases,
    monthlyRevenue,
    lastMonthRevenue,
    newUsersThisMonth,
    newUsersLastMonth,
    recentPurchases,
    pendingCourses,
    recentActivity,
    aiConversations,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    // Total teachers
    prisma.user.count({ where: { role: "TEACHER" } }),
    // Total children
    prisma.child.count(),
    // Total courses
    prisma.course.count(),
    // Published courses
    prisma.course.count({ where: { isPublished: true } }),
    // Draft courses
    prisma.course.count({ where: { isPublished: false } }),
    // Total purchases
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
    // Monthly revenue
    prisma.purchase.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    // Last month revenue
    prisma.purchase.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    // New users this month
    prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    }),
    // New users last month
    prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    // Recent purchases
    prisma.purchase.findMany({
      where: { status: "COMPLETED" },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Pending courses for review
    prisma.course.findMany({
      where: { isPublished: false },
      include: {
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent activity (lesson completions)
    prisma.progress.findMany({
      where: {
        isCompleted: true,
        lastAccessedAt: { gte: sevenDaysAgo },
      },
      include: {
        child: { select: { firstName: true } },
        lesson: {
          select: {
            title: true,
            chapter: {
              select: {
                course: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { lastAccessedAt: "desc" },
      take: 5,
    }),
    // AI conversations count
    prisma.aIConversation.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
  ]);

  const currentRevenue = monthlyRevenue._sum.amount || 0;
  const previousRevenue = lastMonthRevenue._sum.amount || 0;
  const revenueChange =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 100;

  const userChange =
    newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 100;

  return {
    metrics: {
      totalUsers,
      totalTeachers,
      totalChildren,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalPurchases,
      currentRevenue,
      revenueChange,
      newUsersThisMonth,
      userChange,
      aiConversations,
    },
    recentPurchases,
    pendingCourses,
    recentActivity,
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "blue",
}: {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor?: "blue" | "emerald" | "violet" | "amber" | "red";
}) {
  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className={cn("rounded-xl p-2", iconColorClasses[iconColor])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span
              className={cn(
                "font-medium",
                change >= 0 ? "text-emerald-600" : "text-red-600",
              )}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
            {changeLabel && (
              <span className="text-gray-500">{changeLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

async function AdminDashboardContent() {
  const { metrics, recentPurchases, pendingCourses, recentActivity } =
    await getAdminStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Tableau de bord
        </h1>
        <p className="mt-1 text-gray-500">
          Vue d&apos;ensemble de la plateforme Kursus
        </p>
      </div>

      {/* Key Metrics Row 1 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Utilisateurs totaux"
          value={metrics.totalUsers.toLocaleString()}
          change={metrics.userChange}
          changeLabel="vs mois dernier"
          icon={Users}
          iconColor="blue"
        />
        <MetricCard
          title="Enseignants"
          value={metrics.totalTeachers.toLocaleString()}
          icon={GraduationCap}
          iconColor="emerald"
        />
        <MetricCard
          title="Élèves actifs"
          value={metrics.totalChildren.toLocaleString()}
          icon={BookOpen}
          iconColor="violet"
        />
        <MetricCard
          title="Revenus ce mois"
          value={formatCurrency(metrics.currentRevenue)}
          change={metrics.revenueChange}
          changeLabel="vs mois dernier"
          icon={DollarSign}
          iconColor="amber"
        />
      </div>

      {/* Key Metrics Row 2 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Cours publies"
          value={metrics.publishedCourses}
          icon={CheckCircle}
          iconColor="emerald"
        />
        <MetricCard
          title="Cours en attente"
          value={metrics.draftCourses}
          icon={AlertTriangle}
          iconColor="amber"
        />
        <MetricCard
          title="Achats totaux"
          value={metrics.totalPurchases.toLocaleString()}
          icon={ShoppingCart}
          iconColor="blue"
        />
        <MetricCard
          title="Conversations IA (7j)"
          value={metrics.aiConversations}
          icon={MessageSquare}
          iconColor="violet"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Purchases */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-500" />
              Achats recents
            </CardTitle>
            <CardDescription>Les 5 derniers achats</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPurchases.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Aucun achat</p>
            ) : (
              <div className="space-y-3">
                {recentPurchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {purchase.user.name || purchase.user.email}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {purchase.course.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(purchase.amount)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(purchase.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Courses */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cours en attente
            </CardTitle>
            <CardDescription>Cours a valider</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingCourses.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500" />
                <p className="mt-2 text-gray-500">
                  Aucun cours en attente de validation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {course.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Par {course.author.name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      Brouillon
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-violet-500" />
            Activite recente
          </CardTitle>
          <CardDescription>
            Leçons terminées dans les 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-gray-500">Aucune activité</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-xl bg-gray-50 p-3"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {activity.child.firstName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {activity.lesson.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(activity.lastAccessedAt)}
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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
