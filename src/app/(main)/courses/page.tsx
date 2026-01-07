import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCatalogFilters } from "@/components/courses/course-filters";
import { CourseCatalogHeader } from "@/components/courses/course-catalog-header";
import { Skeleton } from "@/components/ui/skeleton";
import { GradeLevel, Subject } from "@prisma/client";

interface SearchParams {
  niveau?: string;
  matiere?: string;
  prix?: string;
  tri?: string;
  q?: string;
}

async function getCourses(searchParams: SearchParams) {
  const where: {
    isPublished: boolean;
    gradeLevel?: GradeLevel;
    subject?: Subject;
    price?: { lte: number };
    OR?: Array<{
      title?: { contains: string; mode: "insensitive" };
      subtitle?: { contains: string; mode: "insensitive" };
    }>;
  } = {
    isPublished: true,
  };

  // Grade level filter
  if (searchParams.niveau && searchParams.niveau !== "all") {
    where.gradeLevel = searchParams.niveau as GradeLevel;
  }

  // Subject filter
  if (searchParams.matiere && searchParams.matiere !== "all") {
    where.subject = searchParams.matiere as Subject;
  }

  // Price filter
  if (searchParams.prix) {
    const maxPrice = parseInt(searchParams.prix) * 100; // Convert to cents
    if (!isNaN(maxPrice)) {
      where.price = { lte: maxPrice };
    }
  }

  // Search query
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q, mode: "insensitive" } },
      { subtitle: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }

  // Sort order
  type OrderBy =
    | { publishedAt: "desc" }
    | { price: "asc" }
    | { price: "desc" }
    | { averageRating: "desc" }
    | { totalStudents: "desc" };

  let orderBy: OrderBy = { publishedAt: "desc" };

  switch (searchParams.tri) {
    case "prix-asc":
      orderBy = { price: "asc" };
      break;
    case "prix-desc":
      orderBy = { price: "desc" };
      break;
    case "note":
      orderBy = { averageRating: "desc" };
      break;
    case "populaire":
      orderBy = { totalStudents: "desc" };
      break;
    default:
      orderBy = { publishedAt: "desc" };
  }

  const courses = await prisma.course.findMany({
    where,
    orderBy,
    include: {
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return courses;
}

function CoursesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border">
          <Skeleton className="aspect-video w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function CoursesList({ searchParams }: { searchParams: SearchParams }) {
  const courses = await getCourses(searchParams);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mb-4">
          <svg
            className="h-10 w-10 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          Aucun cours trouve
        </h3>
        <p className="mt-2 text-gray-500 max-w-sm">
          Essayez de modifier vos filtres ou effectuez une nouvelle recherche.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CourseCatalogHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <CourseCatalogFilters />
          </aside>

          {/* Course Grid */}
          <main className="flex-1">
            <Suspense fallback={<CoursesSkeleton />}>
              <CoursesList searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
