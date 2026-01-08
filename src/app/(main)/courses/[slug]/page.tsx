import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCatalogHeader } from "@/components/courses/course-catalog-header";
import { CourseChapterList } from "@/components/courses/course-chapter-list";
import { CourseReviews } from "@/components/courses/course-reviews";
import { CoursePurchaseCard } from "@/components/courses/course-purchase-card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

const gradeLevelLabels: Record<string, string> = {
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

async function getCourse(slug: string) {
  const course = await prisma.course.findUnique({
    where: { slug, isPublished: true },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          teacherProfile: {
            select: {
              slug: true,
              headline: true,
              bio: true,
              isVerified: true,
              totalStudents: true,
              totalCourses: true,
              averageRating: true,
            },
          },
        },
      },
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: {
              id: true,
              title: true,
              duration: true,
              isFreePreview: true,
              contentType: true,
            },
          },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  return course;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return { title: "Cours non trouve" };
  }

  return {
    title: `${course.title} - Schoolaris`,
    description: course.subtitle || course.description?.slice(0, 160),
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price / 100);
  };

  const learningOutcomes = (course.learningOutcomes as string[] | null) || [];
  const requirements = (course.requirements as string[] | null) || [];

  const totalLessons = course.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.length,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CourseCatalogHeader />

      {/* Hero Section */}
      <div className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2 text-white">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link href="/courses" className="hover:text-white">
                  Catalogue
                </Link>
                <span>/</span>
                <span>{subjectLabels[course.subject] || course.subject}</span>
                <span>/</span>
                <span>
                  {gradeLevelLabels[course.gradeLevel] || course.gradeLevel}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-4 lg:text-4xl">
                {course.title}
              </h1>

              {/* Subtitle */}
              {course.subtitle && (
                <p className="text-lg text-gray-300 mb-6">{course.subtitle}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">
                    {course.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-400">
                    ({course.reviewCount} avis)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-5 w-5" />
                  <span>{course.totalStudents} eleves</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-5 w-5" />
                  <span>{course.totalDuration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <BookOpen className="h-5 w-5" />
                  <span>{totalLessons} lecons</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                  {gradeLevelLabels[course.gradeLevel] || course.gradeLevel}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  {subjectLabels[course.subject] || course.subject}
                </Badge>
              </div>

              {/* Teacher */}
              <div className="flex items-center gap-3">
                {course.author.image ? (
                  <Image
                    src={course.author.image}
                    alt={course.author.name || "Professeur"}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{course.author.name}</span>
                    {course.author.teacherProfile?.isVerified && (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  {course.author.teacherProfile?.headline && (
                    <p className="text-sm text-gray-400">
                      {course.author.teacherProfile.headline}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Card - Desktop */}
            <div className="hidden lg:block">
              <CoursePurchaseCard
                courseId={course.id}
                price={course.price}
                imageUrl={course.imageUrl}
                previewVideoUrl={course.previewVideoUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            {learningOutcomes.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="text-xl font-bold mb-4">
                  Ce que vous apprendrez
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {learningOutcomes.map((outcome, index) => (
                    <div key={index} className="flex gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="rounded-xl border bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Contenu du cours</h2>
                <span className="text-sm text-gray-500">
                  {course.chapters.length} chapitres - {totalLessons} lecons -{" "}
                  {course.totalDuration} min
                </span>
              </div>
              <CourseChapterList chapters={course.chapters} />
            </div>

            {/* Requirements */}
            {requirements.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="text-xl font-bold mb-4">Prerequis</h2>
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex gap-3 text-gray-700">
                      <span className="text-emerald-600">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {course.description && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {course.description}
                  </p>
                </div>
              </div>
            )}

            {/* Teacher Info */}
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-xl font-bold mb-4">A propos du professeur</h2>
              <div className="flex items-start gap-4">
                {course.author.image ? (
                  <Image
                    src={course.author.image}
                    alt={course.author.name || "Professeur"}
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <GraduationCap className="h-10 w-10" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {course.author.name}
                    </h3>
                    {course.author.teacherProfile?.isVerified && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        Verifie
                      </Badge>
                    )}
                  </div>
                  {course.author.teacherProfile?.headline && (
                    <p className="text-gray-600 mb-3">
                      {course.author.teacherProfile.headline}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>
                        {course.author.teacherProfile?.averageRating?.toFixed(
                          1,
                        ) || "0.0"}{" "}
                        note moyenne
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {course.author.teacherProfile?.totalStudents || 0}{" "}
                        eleves
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        {course.author.teacherProfile?.totalCourses || 0} cours
                      </span>
                    </div>
                  </div>
                  {course.author.teacherProfile?.bio && (
                    <p className="text-gray-700">
                      {course.author.teacherProfile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews */}
            <CourseReviews
              courseId={course.id}
              reviews={course.reviews}
              averageRating={course.averageRating}
              reviewCount={course.reviewCount}
            />
          </div>

          {/* Sticky Purchase Card - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <CoursePurchaseCard
                courseId={course.id}
                price={course.price}
                imageUrl={course.imageUrl}
                previewVideoUrl={course.previewVideoUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Purchase Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatPrice(course.price)}
            </p>
            <p className="text-xs text-gray-500">Acces a vie</p>
          </div>
          <Link
            href={`/checkout/${course.id}`}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-emerald-600 px-8 font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Acheter maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
