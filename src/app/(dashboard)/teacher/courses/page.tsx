import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, BookOpen, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeacherCoursesFilters } from "@/components/teacher/teacher-courses-filters";
import { Subject, Prisma } from "@prisma/client";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

const subjectLabels: Record<string, string> = {
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

interface PageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    subject?: string;
  }>;
}

export default async function TeacherCoursesPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const { search, status, subject } = params;

  // Build where clause
  const where: Prisma.CourseWhereInput = {
    authorId: session.user.id,
  };

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (status === "published") {
    where.isPublished = true;
  } else if (status === "draft") {
    where.isPublished = false;
  }

  if (subject && Object.values(Subject).includes(subject as Subject)) {
    where.subject = subject as Subject;
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      _count: {
        select: {
          purchases: {
            where: { status: "COMPLETED" },
          },
          chapters: true,
        },
      },
      purchases: {
        where: { status: "COMPLETED" },
        select: {
          teacherRevenue: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate revenue per course
  const coursesWithRevenue = courses.map((course) => ({
    ...course,
    revenue: course.purchases.reduce(
      (acc: number, p: { teacherRevenue: number }) => acc + p.teacherRevenue,
      0,
    ),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Mes cours
          </h1>
          <p className="mt-1 text-gray-500">
            Gerez et creez vos cours en ligne
          </p>
        </div>
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

      {/* Filters */}
      <TeacherCoursesFilters />

      {/* Courses Grid */}
      {coursesWithRevenue.length === 0 ? (
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">
              {search || status || subject
                ? "Aucun cours trouve"
                : "Aucun cours cree"}
            </h3>
            <p className="mt-2 text-gray-500">
              {search || status || subject
                ? "Essayez de modifier vos filtres de recherche"
                : "Commencez par creer votre premier cours"}
            </p>
            {!search && !status && !subject && (
              <Button
                asChild
                className="mt-6 rounded-xl bg-emerald-500 hover:bg-emerald-600"
              >
                <Link href="/teacher/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Creer un cours
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coursesWithRevenue.map((course) => (
            <Link
              key={course.id}
              href={`/teacher/courses/${course.id}`}
              className="group"
            >
              <Card className="h-full overflow-hidden rounded-2xl border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
                {/* Course Image */}
                <div className="relative aspect-video bg-gray-100">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute left-3 top-3">
                    <Badge
                      className={
                        course.isPublished
                          ? "bg-emerald-500 text-white hover:bg-emerald-500"
                          : "bg-amber-500 text-white hover:bg-amber-500"
                      }
                    >
                      {course.isPublished ? "Publie" : "Brouillon"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Subject & Level */}
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700"
                    >
                      {subjectLabels[course.subject] ?? course.subject}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {course.gradeLevel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 line-clamp-2 font-semibold text-gray-900 group-hover:text-emerald-600">
                    {course.title}
                  </h3>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 border-t pt-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {course._count.purchases}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Étudiants</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-500">
                        <Star className="h-4 w-4 text-amber-400" />
                        <span className="text-sm font-medium">
                          {course.averageRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Note</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-emerald-600">
                        {formatCurrency(course.revenue)}
                      </p>
                      <p className="text-xs text-gray-400">Revenus</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(course.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {course._count.chapters} chapitres
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
