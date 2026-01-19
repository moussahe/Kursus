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
  Sparkles,
  Rocket,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Kursus Brand Colors
const KURSUS = {
  orange: "#ff6d38",
  lime: "#c7ff69",
  purple: "#7a78ff",
};

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
      color: KURSUS.orange,
      bgColor: `${KURSUS.orange}15`,
    },
    {
      name: "Étudiants",
      value: totalStudents.toString(),
      icon: Users,
      description: "Total inscrits",
      trend: "+3.2%",
      trendUp: true,
      color: KURSUS.purple,
      bgColor: `${KURSUS.purple}15`,
    },
    {
      name: "Cours",
      value: `${publishedCourses}/${totalCourses}`,
      icon: BookOpen,
      description: "Publies / Total",
      trend: null,
      trendUp: null,
      color: KURSUS.lime,
      bgColor: `${KURSUS.lime}15`,
    },
    {
      name: "Note moyenne",
      value: averageRating.toFixed(1),
      icon: Star,
      description: "Sur 5 etoiles",
      trend: "+0.2",
      trendUp: true,
      color: "#fbbf24",
      bgColor: "#fbbf2415",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[var(--kursus-bg-elevated)] px-3 py-1">
            <Sparkles className="h-4 w-4 text-[#ff6d38]" />
            <span className="text-sm text-[var(--kursus-text-muted)]">
              Dashboard Enseignant
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--kursus-text)] sm:text-3xl">
            Bonjour, {session.user.name?.split(" ")[0] ?? "Professeur"} !
          </h1>
          <p className="mt-1 text-[var(--kursus-text-muted)]">
            Voici un apercu de vos performances
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="rounded-xl border-[var(--kursus-border)] bg-transparent text-[var(--kursus-text)] hover:bg-[var(--kursus-bg-elevated)]"
          >
            <Link href="/teacher/analytics">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytiques
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl text-black"
            style={{ background: KURSUS.orange }}
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
            className="rounded-2xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[var(--kursus-text-muted)]">
                {stat.name}
              </CardTitle>
              <div
                className="rounded-xl p-2"
                style={{ background: stat.bgColor }}
              >
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-2xl font-black"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-[var(--kursus-text-muted)]">
                  {stat.description}
                </p>
                {stat.trend && (
                  <span
                    className="flex items-center text-xs font-medium"
                    style={{ color: KURSUS.lime }}
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

      {/* Revenue Potential Banner - Show when no/low revenue */}
      {totalRevenue < 10000 && (
        <Card
          className="overflow-hidden rounded-2xl border-0"
          style={{
            background: `linear-gradient(135deg, ${KURSUS.purple}15, ${KURSUS.orange}10)`,
            boxShadow: `0 0 60px -20px ${KURSUS.purple}40`,
          }}
        >
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: `${KURSUS.orange}20` }}
                >
                  <Rocket
                    className="h-7 w-7"
                    style={{ color: KURSUS.orange }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--kursus-text)]">
                    Votre potentiel de revenus
                  </h3>
                  <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                    Avec {Math.max(3, totalCourses)} cours a 5€ et 100
                    ventes/mois, vous pourriez gagner :
                  </p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span
                      className="text-3xl font-black"
                      style={{ color: "var(--kursus-lime-text)" }}
                    >
                      350€
                    </span>
                    <span className="text-[var(--kursus-text-muted)]">
                      /mois
                    </span>
                    <span className="text-[var(--kursus-text-muted)]">·</span>
                    <span
                      className="font-bold"
                      style={{ color: KURSUS.orange }}
                    >
                      4 200€/an
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] hover:bg-[var(--kursus-bg)]"
                >
                  <Link href="/devenir-prof#calculator">
                    <Target className="mr-2 h-4 w-4" />
                    Simuler mes revenus
                  </Link>
                </Button>
                {totalCourses === 0 && (
                  <Button
                    asChild
                    className="rounded-xl text-black"
                    style={{ background: KURSUS.orange }}
                  >
                    <Link href="/teacher/courses/new">
                      <Zap className="mr-2 h-4 w-4" />
                      Creer mon premier cours
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Quick tips */}
            <div className="mt-6 grid gap-3 border-t border-[var(--kursus-border)] pt-6 sm:grid-cols-3">
              {[
                { icon: BookOpen, text: "Plus de cours = plus de revenus" },
                { icon: Star, text: "Les bonnes notes attirent les eleves" },
                {
                  icon: TrendingUp,
                  text: "70% de commission sur chaque vente",
                },
              ].map((tip, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-[var(--kursus-text-muted)]"
                >
                  <tip.icon
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: KURSUS.purple }}
                  />
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <Card className="rounded-2xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-[var(--kursus-text)]">
              Ventes recentes
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/teacher/analytics"
                className="text-[#ff6d38] hover:text-[#ff5722]"
              >
                Voir tout
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <p className="py-8 text-center text-[var(--kursus-text-muted)]">
                Aucune vente pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between rounded-xl bg-[var(--kursus-bg)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={sale.user.image ?? undefined}
                          alt={sale.user.name ?? "User"}
                        />
                        <AvatarFallback
                          className="text-white"
                          style={{ background: KURSUS.purple }}
                        >
                          {sale.user.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[var(--kursus-text)]">
                          {sale.user.name ?? "Utilisateur"}
                        </p>
                        <p className="text-sm text-[var(--kursus-text-muted)]">
                          {sale.course.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: KURSUS.lime }}>
                        +{formatCurrency(sale.teacherRevenue)}
                      </p>
                      <p className="text-xs text-[var(--kursus-text-muted)]">
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
        <Card className="rounded-2xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-[var(--kursus-text)]">
              Mes cours
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href="/teacher/courses"
                className="text-[#ff6d38] hover:text-[#ff5722]"
              >
                Voir tout
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-3 h-12 w-12 text-[var(--kursus-text-muted)]" />
                <p className="text-[var(--kursus-text-muted)]">
                  Aucun cours cree
                </p>
                <Button
                  asChild
                  className="mt-4 rounded-xl text-black"
                  style={{ background: KURSUS.orange }}
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
                    className="flex items-center justify-between rounded-xl bg-[var(--kursus-bg)] p-4 transition-colors hover:bg-[var(--kursus-border)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: `${KURSUS.purple}20` }}
                      >
                        <BookOpen
                          className="h-6 w-6"
                          style={{ color: KURSUS.purple }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--kursus-text)] line-clamp-1">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[var(--kursus-text-muted)]">
                          <span>{course._count.purchases} étudiants</span>
                          <span>-</span>
                          <span>{formatCurrency(course.price)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      className={
                        course.isPublished
                          ? "border-0 text-black"
                          : "border-0 bg-amber-500/20 text-amber-500"
                      }
                      style={
                        course.isPublished
                          ? {
                              background: `${KURSUS.lime}30`,
                              color: KURSUS.lime,
                            }
                          : undefined
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
