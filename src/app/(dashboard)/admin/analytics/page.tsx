import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BookOpen,
  ShoppingCart,
  MessageSquare,
  Star,
  Award,
  Target,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Analytiques | Admin Schoolaris",
  description: "Metriques et KPIs de la plateforme Schoolaris",
};

async function getAnalyticsData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    // Revenue metrics
    monthlyRevenue,
    lastMonthRevenue,
    totalRevenue,
    // User metrics
    totalUsers,
    newUsersThisMonth,
    newUsersLastMonth,
    activeUsersThisWeek,
    // Course metrics
    totalCourses,
    publishedCourses,
    coursesThisMonth,
    // Purchase metrics
    totalPurchases,
    purchasesThisMonth,
    purchasesLastMonth,
    // Engagement metrics
    aiConversationsThisWeek,
    aiConversationsLastWeek,
    totalProgress,
    completedLessons,
    quizAttempts,
    // Children metrics
    totalChildren,
    activeChildren,
    // Teacher metrics
    totalTeachers,
    verifiedTeachers,
    // Review metrics
    avgRating,
    totalReviews,
    // Top performers
    topCourses,
    topTeachers,
  ] = await Promise.all([
    // Revenue metrics
    prisma.purchase.aggregate({
      where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.purchase.aggregate({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    // User metrics
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.user.count({
      where: {
        sessions: { some: { expires: { gte: sevenDaysAgo } } },
      },
    }),
    // Course metrics
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.course.count({ where: { createdAt: { gte: startOfMonth } } }),
    // Purchase metrics
    prisma.purchase.count({ where: { status: "COMPLETED" } }),
    prisma.purchase.count({
      where: { status: "COMPLETED", createdAt: { gte: startOfMonth } },
    }),
    prisma.purchase.count({
      where: {
        status: "COMPLETED",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    }),
    // Engagement metrics
    prisma.aIConversation.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }),
    prisma.aIConversation.count({
      where: {
        createdAt: {
          gte: new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: sevenDaysAgo,
        },
      },
    }),
    prisma.progress.count(),
    prisma.progress.count({ where: { isCompleted: true } }),
    prisma.quizAttempt.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    // Children metrics
    prisma.child.count(),
    prisma.child.count({
      where: { lastActivityAt: { gte: sevenDaysAgo } },
    }),
    // Teacher metrics
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.teacherProfile.count({ where: { isVerified: true } }),
    // Review metrics
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.review.count(),
    // Top performers
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { totalStudents: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        totalStudents: true,
        averageRating: true,
        author: { select: { name: true } },
      },
    }),
    prisma.teacherProfile.findMany({
      orderBy: { totalRevenue: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, image: true } },
      },
    }),
  ]);

  // Calculate growth percentages
  const currentRev = monthlyRevenue._sum.amount || 0;
  const lastRev = lastMonthRevenue._sum.amount || 0;
  const revenueGrowth =
    lastRev > 0 ? ((currentRev - lastRev) / lastRev) * 100 : 100;

  const userGrowth =
    newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 100;

  const purchaseGrowth =
    purchasesLastMonth > 0
      ? ((purchasesThisMonth - purchasesLastMonth) / purchasesLastMonth) * 100
      : 100;

  const aiGrowth =
    aiConversationsLastWeek > 0
      ? ((aiConversationsThisWeek - aiConversationsLastWeek) /
          aiConversationsLastWeek) *
        100
      : 100;

  const completionRate =
    totalProgress > 0 ? (completedLessons / totalProgress) * 100 : 0;

  return {
    revenue: {
      monthly: currentRev,
      total: totalRevenue._sum.amount || 0,
      growth: revenueGrowth,
    },
    users: {
      total: totalUsers,
      newThisMonth: newUsersThisMonth,
      growth: userGrowth,
      activeWeekly: activeUsersThisWeek,
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      newThisMonth: coursesThisMonth,
    },
    purchases: {
      total: totalPurchases,
      thisMonth: purchasesThisMonth,
      growth: purchaseGrowth,
    },
    engagement: {
      aiConversations: aiConversationsThisWeek,
      aiGrowth,
      completionRate,
      quizAttempts,
    },
    children: {
      total: totalChildren,
      active: activeChildren,
    },
    teachers: {
      total: totalTeachers,
      verified: verifiedTeachers,
    },
    reviews: {
      avgRating: avgRating._avg.rating || 0,
      total: totalReviews,
    },
    topCourses,
    topTeachers,
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function MetricCard({
  title,
  value,
  subValue,
  growth,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subValue?: string;
  growth?: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("rounded-xl p-2", color)}>
            <Icon className="h-5 w-5" />
          </div>
          {growth !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                growth >= 0
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
              )}
            >
              {growth >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {growth >= 0 ? "+" : ""}
              {growth.toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
          {subValue && (
            <p className="mt-1 text-xs text-muted-foreground">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
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

async function AnalyticsContent() {
  const data = await getAnalyticsData();

  return (
    <div className="space-y-6">
      {/* Primary Metrics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Metriques principales</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="CA mensuel"
            value={formatCurrency(data.revenue.monthly)}
            subValue={`Total: ${formatCurrency(data.revenue.total)}`}
            growth={data.revenue.growth}
            icon={DollarSign}
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          />
          <MetricCard
            title="Nouveaux utilisateurs"
            value={data.users.newThisMonth}
            subValue={`Total: ${data.users.total}`}
            growth={data.users.growth}
            icon={Users}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <MetricCard
            title="Ventes ce mois"
            value={data.purchases.thisMonth}
            subValue={`Total: ${data.purchases.total}`}
            growth={data.purchases.growth}
            icon={ShoppingCart}
            color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          />
          <MetricCard
            title="Conversations IA"
            value={data.engagement.aiConversations}
            subValue="Cette semaine"
            growth={data.engagement.aiGrowth}
            icon={MessageSquare}
            color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Engagement & Contenu</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Cours publies"
            value={data.courses.published}
            subValue={`${data.courses.newThisMonth} nouveaux ce mois`}
            icon={BookOpen}
            color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
          />
          <MetricCard
            title="Élèves actifs"
            value={data.children.active}
            subValue={`Sur ${data.children.total} inscrits`}
            icon={Activity}
            color="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
          />
          <MetricCard
            title="Taux de completion"
            value={`${data.engagement.completionRate.toFixed(1)}%`}
            subValue={`${data.engagement.quizAttempts} quiz ce mois`}
            icon={Target}
            color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          />
          <MetricCard
            title="Note moyenne"
            value={data.reviews.avgRating.toFixed(1)}
            subValue={`${data.reviews.total} avis`}
            icon={Star}
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Courses */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Top 5 Cours
            </CardTitle>
            <CardDescription>Par nombre d&apos;élèves inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCourses.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Aucun cours publie
              </p>
            ) : (
              <div className="space-y-3">
                {data.topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          index === 0
                            ? "bg-amber-100 text-amber-700"
                            : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">
                          {course.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Par {course.author.name || "Inconnu"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{course.totalStudents}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-amber-500" />
                        {course.averageRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Teachers */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" />
              Top 5 Enseignants
            </CardTitle>
            <CardDescription>Par revenus generes</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topTeachers.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Aucun enseignant inscrit
              </p>
            ) : (
              <div className="space-y-3">
                {data.topTeachers.map((teacher, index) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between rounded-xl bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                          index === 0
                            ? "bg-emerald-100 text-emerald-700"
                            : index === 1
                              ? "bg-gray-200 text-gray-700"
                              : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">
                          {teacher.user.name || "Inconnu"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.totalCourses} cours • {teacher.totalStudents}{" "}
                          élèves
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(teacher.totalRevenue)}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-amber-500" />
                        {teacher.averageRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPIs Summary */}
      <Card className="rounded-2xl border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold">Resume des KPIs</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-3xl font-bold">{data.users.total}</p>
              <p className="text-sm opacity-90">Utilisateurs totaux</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-3xl font-bold">{data.courses.published}</p>
              <p className="text-sm opacity-90">Cours disponibles</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-3xl font-bold">
                {data.teachers.verified}/{data.teachers.total}
              </p>
              <p className="text-sm opacity-90">Enseignants vérifiés</p>
            </div>
            <div className="rounded-xl bg-white/20 p-4">
              <p className="text-3xl font-bold">
                {formatCurrency(data.revenue.total)}
              </p>
              <p className="text-sm opacity-90">CA total genere</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Analytiques
        </h1>
        <p className="mt-1 text-muted-foreground">
          Metriques et indicateurs de performance de la plateforme
        </p>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
