import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCatalogFilters } from "@/components/courses/course-filters";
import { CourseCatalogHeader } from "@/components/courses/course-catalog-header";
import { ActiveFilterBadges } from "@/components/courses/active-filter-badges";
import { QuickFilterChips } from "@/components/courses/quick-filter-chips";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { GradeLevel, Subject } from "@prisma/client";

const COURSES_PER_PAGE = 12;

interface SearchParams {
  niveau?: string;
  matiere?: string;
  prix?: string;
  tri?: string;
  q?: string;
  page?: string;
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

  // Sort order with weighted rating for "note" (rating + review count)
  type OrderByItem =
    | { publishedAt: "desc" }
    | { price: "asc" }
    | { price: "desc" }
    | { averageRating: "desc" }
    | { reviewCount: "desc" }
    | { totalStudents: "desc" };

  let orderBy: OrderByItem | OrderByItem[] = { publishedAt: "desc" };

  switch (searchParams.tri) {
    case "prix-asc":
      orderBy = { price: "asc" };
      break;
    case "prix-desc":
      orderBy = { price: "desc" };
      break;
    case "note":
      // Compound sort: rating first, then review count as tiebreaker
      // This ensures 4.8 with 500 reviews beats 5.0 with 1 review
      orderBy = [{ averageRating: "desc" }, { reviewCount: "desc" }];
      break;
    case "populaire":
      orderBy = { totalStudents: "desc" };
      break;
    default:
      orderBy = { publishedAt: "desc" };
  }

  // Pagination
  const page = Math.max(1, parseInt(searchParams.page || "1") || 1);
  const skip = (page - 1) * COURSES_PER_PAGE;

  // Fetch courses and total count in parallel
  const [courses, totalCount] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: COURSES_PER_PAGE,
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / COURSES_PER_PAGE);

  return {
    courses,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

function CoursePagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: SearchParams;
}) {
  // Build URL with existing params + new page
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.niveau && searchParams.niveau !== "all") {
      params.set("niveau", searchParams.niveau);
    }
    if (searchParams.matiere && searchParams.matiere !== "all") {
      params.set("matiere", searchParams.matiere);
    }
    if (searchParams.prix) {
      params.set("prix", searchParams.prix);
    }
    if (searchParams.tri) {
      params.set("tri", searchParams.tri);
    }
    if (searchParams.q) {
      params.set("q", searchParams.q);
    }
    if (page > 1) {
      params.set("page", page.toString());
    }
    const queryString = params.toString();
    return `/courses${queryString ? `?${queryString}` : ""}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const showPages = 5; // Max pages to show

    if (totalPages <= showPages) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {/* Previous */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage > 1}
        disabled={currentPage === 1}
        className="gap-1"
      >
        {currentPage > 1 ? (
          <Link href={buildPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Precedent
          </Link>
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" />
            Precedent
          </>
        )}
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              asChild={currentPage !== page}
              className={
                currentPage === page
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : ""
              }
            >
              {currentPage === page ? (
                <span>{page}</span>
              ) : (
                <Link href={buildPageUrl(page)}>{page}</Link>
              )}
            </Button>
          ),
        )}
      </div>

      {/* Next */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage < totalPages}
        disabled={currentPage === totalPages}
        className="gap-1"
      >
        {currentPage < totalPages ? (
          <Link href={buildPageUrl(currentPage + 1)}>
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            Suivant
            <ChevronRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </nav>
  );
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
  const { courses, pagination } = await getCourses(searchParams);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-4">
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

        {/* Suggestions */}
        <div className="mt-8 space-y-3">
          <p className="text-sm font-medium text-gray-700">Suggestions :</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/courses?matiere=MATHEMATIQUES"
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <TrendingUp className="h-4 w-4" />
              Mathematiques
            </Link>
            <Link
              href="/courses?matiere=FRANCAIS"
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Francais
            </Link>
            <Link
              href="/courses?tri=populaire"
              className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Les plus populaires
            </Link>
          </div>
        </div>

        {/* Clear filters button */}
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
        >
          Voir tous les cours
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active filter badges */}
      <ActiveFilterBadges />

      {/* Results count with better formatting */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">
            {pagination.totalCount}
          </span>{" "}
          cours trouvés
        </p>
        <p className="text-sm text-gray-500">
          Page {pagination.currentPage} sur {pagination.totalPages}
        </p>
      </div>

      {/* Course grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <CoursePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          searchParams={searchParams}
        />
      )}
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
            {/* Quick Filter Chips */}
            <Suspense fallback={null}>
              <QuickFilterChips />
            </Suspense>

            <Suspense fallback={<CoursesSkeleton />}>
              <CoursesList searchParams={params} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
