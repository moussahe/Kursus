"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Users,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    totalStudents: number;
    averageRating: number;
    conversionRate: number;
  };
  monthlyRevenue: { month: string; revenue: number }[];
  monthlyStudents: { month: string; students: number }[];
  topCourses: {
    id: string;
    title: string;
    students: number;
    revenue: number;
    rating: number;
    reviewCount: number;
  }[];
  recentSales: {
    id: string;
    userName: string;
    userEmail: string;
    userImage: string | null;
    courseTitle: string;
    amount: number;
    date: string;
  }[];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function SimpleBarChart({
  data,
  dataKey,
  color = "emerald",
}: {
  data: { month: string; [key: string]: string | number }[];
  dataKey: string;
  color?: "emerald" | "blue";
}) {
  const values = data.map((d) => Number(d[dataKey]));
  const maxValue = Math.max(...values, 1);

  const colorClasses = {
    emerald: "from-emerald-400 to-emerald-600",
    blue: "from-blue-400 to-blue-600",
  };

  return (
    <div className="flex h-64 items-end gap-2">
      {data.map((item, index) => {
        const value = Number(item[dataKey]);
        const height = (value / maxValue) * 100;
        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative w-full flex flex-col items-center">
              <span className="text-xs font-medium text-gray-600 mb-1">
                {dataKey === "revenue"
                  ? formatCurrency(value)
                  : value.toString()}
              </span>
              <div
                className={`w-full max-w-12 rounded-t-lg bg-gradient-to-t ${colorClasses[color]} transition-all duration-500`}
                style={{ height: `${Math.max(height * 2, 8)}px` }}
              />
            </div>
            <span className="text-xs text-gray-500 truncate max-w-full">
              {item.month.split(" ")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className="rounded-xl bg-emerald-50 p-2">
          <Icon className="h-4 w-4 text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">{description}</p>
          {trend && (
            <span
              className={`flex items-center text-xs font-medium ${
                trendUp ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trendUp ? (
                <ArrowUpRight className="mr-0.5 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-0.5 h-3 w-3" />
              )}
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/analytics");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des analytiques");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 text-emerald-600 hover:underline"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Analytiques
        </h1>
        <p className="mt-1 text-gray-500">Suivez vos performances et revenus</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Revenus totaux"
          value={formatCurrency(data.metrics.totalRevenue)}
          description="Total des ventes"
          icon={DollarSign}
          trend="+12.5%"
          trendUp
        />
        <MetricCard
          title="Étudiants"
          value={data.metrics.totalStudents.toString()}
          description="Total inscrits"
          icon={Users}
          trend="+8.2%"
          trendUp
        />
        <MetricCard
          title="Note moyenne"
          value={data.metrics.averageRating.toFixed(1)}
          description="Sur 5 etoiles"
          icon={Star}
          trend="+0.3"
          trendUp
        />
        <MetricCard
          title="Taux de conversion"
          value={`${data.metrics.conversionRate.toFixed(1)}%`}
          description="Visiteurs -> Acheteurs"
          icon={TrendingUp}
          trend="+1.2%"
          trendUp
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-white border rounded-xl">
          <TabsTrigger value="revenue" className="rounded-lg">
            Revenus
          </TabsTrigger>
          <TabsTrigger value="students" className="rounded-lg">
            Étudiants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Revenus mensuels</CardTitle>
              <CardDescription>
                Evolution de vos revenus sur les 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={data.monthlyRevenue}
                dataKey="revenue"
                color="emerald"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Inscriptions mensuelles</CardTitle>
              <CardDescription>
                Nouveaux étudiants sur les 6 derniers mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart
                data={data.monthlyStudents}
                dataKey="students"
                color="blue"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Courses */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Cours les plus performants</CardTitle>
            <CardDescription>Vos meilleurs cours par revenus</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topCourses.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                Aucun cours publie pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {data.topCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{course.students} étudiants</span>
                          {course.rating > 0 && (
                            <>
                              <span>-</span>
                              <span className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-0.5" />
                                {course.rating.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        {formatCurrency(course.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Ventes recentes</CardTitle>
            <CardDescription>Vos dernieres transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentSales.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                Aucune vente pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {data.recentSales.slice(0, 5).map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={sale.userImage ?? undefined}
                          alt={sale.userName}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {sale.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {sale.userName}
                        </p>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {sale.courseTitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        +{formatCurrency(sale.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
