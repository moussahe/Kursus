import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  Users,
  BookOpen,
  Star,
  Plus,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
    year: "numeric",
  }).format(date);
}

export default async function TeacherDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch teacher profile and stats
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: session.user.id },
  });

  // Fetch courses
  const courses = await prisma.course.findMany({
    where: { authorId: session.user.id },
    include: {
      _count: {
        select: {
          purchases: {
            where: { status: "COMPLETED" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch recent sales
  const recentSales = await prisma.purchase.findMany({
    where: {
      course: { authorId: session.user.id },
      status: "COMPLETED",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculate stats
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.isPublished).length;
  const totalStudents = teacherProfile?.totalStudents ?? 0;
  const totalRevenue = teacherProfile?.totalRevenue ?? 0;
  const averageRating = teacherProfile?.averageRating ?? 0;

  const stats = [
    {
      name: "Revenus totaux",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      description: "Ce mois",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      name: "Étudiants",
      value: totalStudents.toString(),
      icon: Users,
      description: "Total inscrits",
      trend: "+3.2%",
      trendUp: true,
    },
    {
      name: "Cours",
      value: `${publishedCourses}/${totalCourses}`,
      icon: BookOpen,
      description: "Publies / Total",
      trend: null,
      trendUp: null,
    },
    {
      name: "Note moyenne",
      value: averageRating.toFixed(1),
      icon: Star,
      description: "Sur 5 etoiles",
      trend: "+0.2",
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Bonjour, {session.user.name?.split(" ")[0] ?? "Professeur"} !
          </h1>
          <p className="mt-1 text-gray-500">
            Voici un apercu de vos performances
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/teacher/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytiques
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            <Link href="/teacher/courses/new">
              <Plus className="mr-2 h-4 w-4" />
              Creer un cours
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="rounded-2xl border-0 bg-white shadow-sm"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.name}
              </CardTitle>
              <div className="rounded-xl bg-emerald-50 p-2">
                <stat.icon className="h-4 w-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">{stat.description}</p>
                {stat.trend && (
                  <span
                    className={`flex items-center text-xs font-medium ${
                      stat.trendUp ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    <TrendingUp
                      className={`mr-0.5 h-3 w-3 ${!stat.trendUp && "rotate-180"}`}
                    />
                    {stat.trend}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Ventes recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teacher/analytics" className="text-emerald-600">
                Voir tout
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                Aucune vente pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={sale.user.image ?? undefined}
                          alt={sale.user.name ?? "User"}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {sale.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {sale.user.name ?? "Utilisateur"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale.course.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-600">
                        +{formatCurrency(sale.teacherRevenue)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions / Recent Courses */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Mes cours</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/teacher/courses" className="text-emerald-600">
                Voir tout
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                <p className="text-gray-500">Aucun cours cree</p>
                <Button
                  asChild
                  className="mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  <Link href="/teacher/courses/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Creer votre premier cours
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/teacher/courses/${course.id}`}
                    className="flex items-center justify-between rounded-xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                        <BookOpen className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{course._count.purchases} étudiants</span>
                          <span>-</span>
                          <span>{formatCurrency(course.price)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        course.isPublished
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                      }
                    >
                      {course.isPublished ? "Publie" : "Brouillon"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
