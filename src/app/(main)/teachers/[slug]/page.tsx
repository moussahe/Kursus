import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CourseCatalogHeader } from "@/components/courses/course-catalog-header";
import { CourseCard } from "@/components/courses/course-card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Users,
  BookOpen,
  GraduationCap,
  CheckCircle,
  Award,
  Calendar,
} from "lucide-react";

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

async function getTeacherProfile(slug: string) {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          courses: {
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            include: {
              _count: {
                select: {
                  purchases: true,
                  reviews: true,
                },
              },
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return teacher;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacherProfile(slug);

  if (!teacher) {
    return { title: "Professeur non trouve" };
  }

  return {
    title: `${teacher.user.name || "Professeur"} - Kursus`,
    description:
      teacher.headline || `Decouvrez les cours de ${teacher.user.name}`,
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const teacher = await getTeacherProfile(slug);

  if (!teacher) {
    notFound();
  }

  const courses = teacher.user.courses;
  const totalStudents = teacher.totalStudents;
  const totalCourses = teacher.totalCourses;
  const averageRating = teacher.averageRating;

  // Calculate total reviews from courses
  const totalReviews = courses.reduce(
    (acc, course) => acc + course._count.reviews,
    0,
  );

  // Get initials for avatar fallback
  const getInitials = (name: string | null) => {
    if (!name) return "P";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <CourseCatalogHeader />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800">
        {/* Cover Image Overlay */}
        {teacher.coverImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={teacher.coverImageUrl}
              alt="Couverture"
              fill
              className="object-cover opacity-20"
              priority
            />
          </div>
        )}

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:text-left lg:gap-8">
            {/* Avatar */}
            <div className="relative mb-6 lg:mb-0">
              {teacher.avatarUrl || teacher.user.image ? (
                <Image
                  src={teacher.avatarUrl || teacher.user.image!}
                  alt={teacher.user.name || "Professeur"}
                  width={160}
                  height={160}
                  className="h-32 w-32 rounded-full border-4 border-white/20 object-cover shadow-xl lg:h-40 lg:w-40"
                  priority
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-4xl font-bold text-white shadow-xl lg:h-40 lg:w-40">
                  {getInitials(teacher.user.name)}
                </div>
              )}
              {teacher.isVerified && (
                <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-start">
                <h1 className="text-3xl font-bold lg:text-4xl">
                  {teacher.user.name || "Professeur"}
                </h1>
                {teacher.isVerified && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Professeur verifie
                  </Badge>
                )}
              </div>

              {teacher.headline && (
                <p className="mt-3 text-lg text-emerald-100 lg:text-xl">
                  {teacher.headline}
                </p>
              )}

              {/* Specialties */}
              {teacher.specialties && teacher.specialties.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {teacher.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      {subjectLabels[specialty] || specialty}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Experience */}
              {teacher.yearsExperience && (
                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-100 lg:justify-start">
                  <Calendar className="h-5 w-5" />
                  <span>{teacher.yearsExperience} ans d&apos;experience</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
            <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4 lg:flex-row lg:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="mt-2 text-center lg:mt-0 lg:text-left">
                <p className="text-2xl font-bold text-gray-900">
                  {totalCourses}
                </p>
                <p className="text-sm text-gray-500">Cours publies</p>
              </div>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4 lg:flex-row lg:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-2 text-center lg:mt-0 lg:text-left">
                <p className="text-2xl font-bold text-gray-900">
                  {totalStudents}
                </p>
                <p className="text-sm text-gray-500">Élèves inscrits</p>
              </div>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4 lg:flex-row lg:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div className="mt-2 text-center lg:mt-0 lg:text-left">
                <p className="text-2xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">
                  Note moyenne ({totalReviews} avis)
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4 lg:flex-row lg:gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mt-2 text-center lg:mt-0 lg:text-left">
                <p className="text-2xl font-bold text-gray-900">
                  {teacher.yearsExperience || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Annees d&apos;experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - Bio & Qualifications */}
          <div className="space-y-6 lg:col-span-1">
            {/* Bio */}
            {teacher.bio && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <GraduationCap className="h-5 w-5 text-emerald-600" />A propos
                </h2>
                <p className="whitespace-pre-wrap text-gray-700">
                  {teacher.bio}
                </p>
              </div>
            )}

            {/* Qualifications */}
            {teacher.qualifications && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Qualifications
                </h2>
                <p className="whitespace-pre-wrap text-gray-700">
                  {teacher.qualifications}
                </p>
              </div>
            )}

            {/* Specialties Detail */}
            {teacher.specialties && teacher.specialties.length > 0 && (
              <div className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Matieres enseignees
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.specialties.map((specialty) => (
                    <Badge
                      key={specialty}
                      className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    >
                      {subjectLabels[specialty] || specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Cours de {teacher.user.name}
              </h2>
              <span className="text-sm text-gray-500">
                {courses.length} cours disponible{courses.length > 1 ? "s" : ""}
              </span>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-xl border bg-white p-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Aucun cours publie
                </h3>
                <p className="mt-2 text-gray-500">
                  Ce professeur n&apos;a pas encore publie de cours.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={{
                      id: course.id,
                      slug: course.slug,
                      title: course.title,
                      subtitle: course.subtitle,
                      imageUrl: course.imageUrl,
                      price: course.price,
                      gradeLevel: course.gradeLevel,
                      subject: course.subject,
                      totalStudents: course.totalStudents,
                      totalLessons: course.totalLessons,
                      totalDuration: course.totalDuration,
                      averageRating: course.averageRating,
                      reviewCount: course.reviewCount,
                      author: {
                        name: course.author.name,
                        image: course.author.image,
                      },
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold lg:text-3xl">
              Pret a commencer votre apprentissage ?
            </h2>
            <p className="mt-3 text-emerald-100">
              Explorez les cours de {teacher.user.name} et developpez vos
              competences
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-white px-8 font-semibold text-emerald-600 transition-colors hover:bg-gray-100"
            >
              Decouvrir tous les cours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
