import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { Subject, Prisma } from "@prisma/client";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Star,
  Users,
  TrendingUp,
  GraduationCap,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CoursesFilters } from "./courses-filters";
import { CourseActions } from "./course-actions";

export const metadata = {
  title: "Gestion des cours | Admin Schoolaris",
  description: "Moderer et valider les cours de la plateforme Schoolaris",
};

interface SearchParams {
  status?: string;
  subject?: string;
  search?: string;
  page?: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

const GRADE_LABELS: Record<string, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "2nde",
  PREMIERE: "1ere",
  TERMINALE: "Terminale",
};

const VALID_SUBJECTS: Subject[] = [
  "MATHEMATIQUES",
  "FRANCAIS",
  "HISTOIRE_GEO",
  "SCIENCES",
  "ANGLAIS",
  "PHYSIQUE_CHIMIE",
  "SVT",
  "PHILOSOPHIE",
  "ESPAGNOL",
  "ALLEMAND",
  "SES",
  "NSI",
];

function isValidSubject(value: string): value is Subject {
  return VALID_SUBJECTS.includes(value as Subject);
}

async function getCoursesData(searchParams: SearchParams) {
  const status = searchParams.status;
  const subject = searchParams.subject;
  const search = searchParams.search || "";
  const page = parseInt(searchParams.page || "1");
  const limit = 15;
  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {
    ...(status === "published"
      ? { isPublished: true }
      : status === "draft"
        ? { isPublished: false }
        : {}),
    ...(subject && subject !== "all" && isValidSubject(subject)
      ? { subject }
      : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            {
              author: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const [courses, total, stats] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            teacherProfile: {
              select: { isVerified: true },
            },
          },
        },
        _count: {
          select: {
            purchases: true,
            reviews: true,
            chapters: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.course.count({ where }),
    prisma.$transaction([
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.course.count({ where: { isPublished: false } }),
      prisma.purchase.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]),
  ]);

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      total: stats[0],
      published: stats[1],
      draft: stats[2],
      totalRevenue: stats[3]._sum.amount || 0,
    },
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn("rounded-xl p-3", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

async function CoursesContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { courses, pagination, stats } = await getCoursesData(searchParams);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total cours"
          value={stats.total}
          icon={BookOpen}
          color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Cours publies"
          value={stats.published}
          icon={CheckCircle}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          title="En attente"
          value={stats.draft}
          icon={Clock}
          color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
        <StatCard
          title="Revenus totaux"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        />
      </div>

      {/* Filters */}
      <CoursesFilters
        currentStatus={searchParams.status || "all"}
        currentSubject={searchParams.subject || "all"}
        currentSearch={searchParams.search || ""}
      />

      {/* Courses Table */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm dark:bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            Cours ({pagination.total})
          </CardTitle>
          <CardDescription>
            Moderez et validez les cours de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Aucun cours trouve</p>
            </div>
          ) : (
            <div className="divide-y">
              {courses.map((course) => {
                const authorInitials = course.author.name
                  ? course.author.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                  : "?";

                return (
                  <div
                    key={course.id}
                    className="flex flex-col gap-4 p-4 hover:bg-muted/30 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      {/* Course Image */}
                      <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        {course.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.imageUrl}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold truncate">
                            {course.title}
                          </h3>
                          <Badge
                            className={cn(
                              "text-xs",
                              course.isPublished
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            )}
                          >
                            {course.isPublished ? (
                              <>
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Publie
                              </>
                            ) : (
                              <>
                                <Clock className="mr-1 h-3 w-3" />
                                Brouillon
                              </>
                            )}
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {SUBJECT_LABELS[course.subject] || course.subject}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {GRADE_LABELS[course.gradeLevel] ||
                              course.gradeLevel}
                          </Badge>
                          <span>{formatCurrency(course.price)}</span>
                          <span>•</span>
                          <span>{course._count.chapters} chapitres</span>
                        </div>

                        {/* Author */}
                        <div className="mt-2 flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={course.author.image ?? undefined}
                              alt={course.author.name ?? "Author"}
                            />
                            <AvatarFallback className="text-xs">
                              {authorInitials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Par {course.author.name || "Inconnu"}
                          </span>
                          {course.author.teacherProfile?.isVerified && (
                            <Badge
                              variant="outline"
                              className="text-xs text-emerald-600 border-emerald-200"
                            >
                              Verifie
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {course.totalStudents}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Élèves
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500" />
                            {course.averageRating.toFixed(1)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ({course.reviewCount})
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-emerald-600">
                            {formatCurrency(
                              course.price * course._count.purchases,
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">CA</p>
                        </div>
                      </div>

                      <CourseActions
                        courseId={course.id}
                        isPublished={course.isPublished}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages} (
                {pagination.total} cours)
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 && (
                  <a
                    href={`/admin/courses?page=${pagination.page - 1}&status=${searchParams.status || "all"}&subject=${searchParams.subject || "all"}&search=${searchParams.search || ""}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Precedent
                  </a>
                )}
                {pagination.page < pagination.totalPages && (
                  <a
                    href={`/admin/courses?page=${pagination.page + 1}&status=${searchParams.status || "all"}&subject=${searchParams.subject || "all"}&search=${searchParams.search || ""}`}
                    className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                  >
                    Suivant
                  </a>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Gestion des cours
        </h1>
        <p className="mt-1 text-muted-foreground">
          Moderez et validez les cours de la marketplace
        </p>
      </div>

      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesContent searchParams={params} />
      </Suspense>
    </div>
  );
}
