import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Play,
  Clock,
  FileText,
  Video,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCompletionCertificate } from "@/components/certificates/course-completion-certificate";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

async function getCourseDetails(courseId: string, childId: string) {
  const purchase = await prisma.purchase.findFirst({
    where: {
      courseId,
      childId,
      status: "COMPLETED",
    },
    include: {
      course: {
        include: {
          author: {
            select: { name: true, image: true },
          },
          chapters: {
            where: { isPublished: true },
            include: {
              lessons: {
                where: { isPublished: true },
                include: {
                  quizzes: {
                    select: { id: true },
                  },
                },
                orderBy: { position: "asc" },
              },
            },
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (!purchase) return null;

  const course = purchase.course;

  // Check for existing certificate
  const existingCertificate = await prisma.certificate.findUnique({
    where: {
      childId_courseId: {
        childId,
        courseId,
      },
    },
  });

  // Get progress for each lesson
  const chaptersWithProgress = await Promise.all(
    course.chapters.map(async (chapter) => {
      const lessonsWithProgress = await Promise.all(
        chapter.lessons.map(async (lesson) => {
          const progress = await prisma.progress.findUnique({
            where: { childId_lessonId: { childId, lessonId: lesson.id } },
          });
          return {
            ...lesson,
            isCompleted: progress?.isCompleted ?? false,
            quizScore: progress?.quizScore ?? null,
            hasQuiz: lesson.quizzes.length > 0,
          };
        }),
      );

      const completedCount = lessonsWithProgress.filter(
        (l) => l.isCompleted,
      ).length;

      return {
        ...chapter,
        lessons: lessonsWithProgress,
        completedCount,
        totalCount: lessonsWithProgress.length,
      };
    }),
  );

  const totalLessons = chaptersWithProgress.reduce(
    (sum, ch) => sum + ch.totalCount,
    0,
  );
  const completedLessons = chaptersWithProgress.reduce(
    (sum, ch) => sum + ch.completedCount,
    0,
  );

  return {
    course: {
      ...course,
      chapters: chaptersWithProgress,
    },
    totalLessons,
    completedLessons,
    progress: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
    existingCertificate,
  };
}

function CourseDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-24" />
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const contentTypeIcons = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
  EXERCISE: FileText,
  DOCUMENT: FileText,
};

async function CourseDetail({
  courseId,
  childId,
}: {
  courseId: string;
  childId: string;
}) {
  const data = await getCourseDetails(courseId, childId);

  if (!data) {
    notFound();
  }

  const {
    course,
    totalLessons,
    completedLessons,
    progress,
    existingCertificate,
  } = data;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href="/student/courses">
          <ArrowLeft className="h-4 w-4" />
          Retour aux cours
        </Link>
      </Button>

      {/* Course Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              width={192}
              height={192}
              className="h-48 w-48 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100">
              <BookOpen className="h-16 w-16 text-violet-400" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-1 text-gray-500">
              Par {course.author.name ?? "Anonyme"}
            </p>
            {course.subtitle && (
              <p className="mt-3 text-gray-600">{course.subtitle}</p>
            )}

            {/* Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progression</span>
                <span className="font-medium text-gray-900">
                  {completedLessons}/{totalLessons} lecons
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress === 100 && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Cours termine !</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Certificate Section */}
        <div className="mt-6 border-t pt-6">
          <CourseCompletionCertificate
            courseId={courseId}
            childId={childId}
            progress={progress}
            existingCertificate={existingCertificate}
          />
        </div>
      </div>

      {/* Chapters */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Contenu du cours
        </h2>
        {course.chapters.map((chapter, chapterIndex) => (
          <div
            key={chapter.id}
            className="rounded-2xl bg-white shadow-sm overflow-hidden"
          >
            {/* Chapter Header */}
            <div className="border-b bg-gray-50 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-sm font-semibold text-violet-600">
                    {chapterIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {chapter.title}
                    </h3>
                    {chapter.description && (
                      <p className="text-sm text-gray-500">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {chapter.completedCount}/{chapter.totalCount} lecons
                </div>
              </div>
            </div>

            {/* Lessons */}
            <div className="divide-y">
              {chapter.lessons.map((lesson, lessonIndex) => {
                const Icon = contentTypeIcons[lesson.contentType] || FileText;

                return (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                    className={cn(
                      "flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50",
                      lesson.isCompleted && "bg-emerald-50/50",
                    )}
                  >
                    {/* Status Icon */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        lesson.isCompleted ? "bg-emerald-100" : "bg-gray-100",
                      )}
                    >
                      {lesson.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <span className="text-sm font-medium text-gray-500">
                          {lessonIndex + 1}
                        </span>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span
                          className={cn(
                            "font-medium truncate",
                            lesson.isCompleted
                              ? "text-emerald-700"
                              : "text-gray-900",
                          )}
                        >
                          {lesson.title}
                        </span>
                        {lesson.hasQuiz && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            Quiz
                          </span>
                        )}
                      </div>
                      {lesson.duration && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} min
                        </div>
                      )}
                    </div>

                    {/* Quiz Score */}
                    {lesson.quizScore !== null && (
                      <div
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          lesson.quizScore >= 70
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700",
                        )}
                      >
                        {lesson.quizScore}%
                      </div>
                    )}

                    {/* Play Icon */}
                    {!lesson.isCompleted && (
                      <Play className="h-5 w-5 text-violet-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function StudentCourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const selectedChildId = cookieStore.get("selectedChildId")?.value;

  let childId = selectedChildId;
  if (!childId) {
    const firstChild = await prisma.child.findFirst({
      where: { parentId: session.user.id },
      select: { id: true },
    });
    childId = firstChild?.id;
  }

  if (!childId) {
    redirect("/parent/children?message=add_child_first");
  }

  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetail courseId={courseId} childId={childId} />
    </Suspense>
  );
}
