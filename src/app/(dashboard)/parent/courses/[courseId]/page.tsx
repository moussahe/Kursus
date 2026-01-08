import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  User,
  FileText,
  HelpCircle,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/parent/progress-bar";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    childId?: string;
  }>;
}

async function getCourseWithProgress(
  courseId: string,
  userId: string,
  childId?: string,
) {
  // Verify the user has purchased this course
  const purchase = await prisma.purchase.findFirst({
    where: {
      courseId,
      userId,
      status: "COMPLETED",
    },
  });

  if (!purchase) {
    return null;
  }

  // Get course details
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      author: {
        select: { name: true, image: true },
      },
      chapters: {
        where: { isPublished: true },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!course) {
    return null;
  }

  // Get progress for the child (if specified) or for any child
  let progress: { lessonId: string; isCompleted: boolean }[] = [];

  if (childId) {
    progress = await prisma.progress.findMany({
      where: {
        childId,
        lesson: {
          chapter: {
            courseId,
          },
        },
      },
      select: {
        lessonId: true,
        isCompleted: true,
      },
    });
  }

  // Calculate overall progress
  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0,
  );
  const completedLessons = progress.filter((p) => p.isCompleted).length;
  const progressPercentage =
    totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Build chapters with lesson progress
  const chaptersWithProgress = course.chapters.map((chapter) => {
    const lessonsWithProgress = chapter.lessons.map((lesson) => {
      const lessonProgress = progress.find((p) => p.lessonId === lesson.id);
      return {
        ...lesson,
        isCompleted: lessonProgress?.isCompleted ?? false,
      };
    });

    const chapterCompleted = lessonsWithProgress.every((l) => l.isCompleted);
    const chapterProgress =
      lessonsWithProgress.length > 0
        ? (lessonsWithProgress.filter((l) => l.isCompleted).length /
            lessonsWithProgress.length) *
          100
        : 0;

    return {
      ...chapter,
      lessons: lessonsWithProgress,
      isCompleted: chapterCompleted,
      progress: chapterProgress,
    };
  });

  return {
    ...course,
    chapters: chaptersWithProgress,
    totalLessons,
    completedLessons,
    progressPercentage,
    childId,
  };
}

const contentTypeIcons = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
  EXERCISE: BookOpen,
  DOCUMENT: FileText,
};

const contentTypeLabels = {
  VIDEO: "Video",
  TEXT: "Texte",
  QUIZ: "Quiz",
  EXERCISE: "Exercice",
  DOCUMENT: "Document",
};

function CourseViewerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-48 rounded-2xl" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function CourseViewer({
  courseId,
  userId,
  childId,
}: {
  courseId: string;
  userId: string;
  childId?: string;
}) {
  const course = await getCourseWithProgress(courseId, userId, childId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild className="gap-2">
        <Link href={childId ? `/parent/children/${childId}` : "/parent"}>
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
      </Button>

      {/* Course Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Course Image */}
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              width={192}
              height={128}
              className="h-48 w-full rounded-xl object-cover lg:h-32 lg:w-48"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 lg:h-32 lg:w-48">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          )}

          {/* Course Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            {course.subtitle && (
              <p className="mt-2 text-gray-600">{course.subtitle}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                {course.author.name ?? "Professeur"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} lecons
              </div>
              {course.totalDuration > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {Math.floor(course.totalDuration / 60)}h{" "}
                  {course.totalDuration % 60}min
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="lg:w-64">
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Progression
                </span>
                <span className="text-sm font-bold text-emerald-600">
                  {Math.round(course.progressPercentage)}%
                </span>
              </div>
              <ProgressBar
                value={course.progressPercentage}
                showLabel={false}
                size="lg"
              />
              <p className="mt-2 text-xs text-gray-500">
                {course.completedLessons}/{course.totalLessons} lecons terminees
              </p>
            </div>
          </div>
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
            <div className="border-b bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                      chapter.isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-200 text-gray-600",
                    )}
                  >
                    {chapter.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      chapterIndex + 1
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {chapter.title}
                    </h3>
                    {chapter.description && (
                      <p className="text-sm text-gray-500">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {chapter.lessons.filter((l) => l.isCompleted).length}/
                    {chapter.lessons.length}
                  </span>
                  <ProgressBar
                    value={chapter.progress}
                    showLabel={false}
                    className="w-24"
                  />
                </div>
              </div>
            </div>

            {/* Lessons */}
            <div className="divide-y">
              {chapter.lessons.map((lesson, lessonIndex) => {
                const Icon =
                  contentTypeIcons[
                    lesson.contentType as keyof typeof contentTypeIcons
                  ] || FileText;
                const isLocked = false; // For now, all purchased lessons are unlocked

                return (
                  <Link
                    key={lesson.id}
                    href={`/parent/courses/${course.id}/lessons/${lesson.id}${
                      childId ? `?childId=${childId}` : ""
                    }`}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 transition-colors",
                      isLocked
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-50",
                    )}
                  >
                    {/* Lesson Status */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        lesson.isCompleted
                          ? "bg-emerald-100"
                          : isLocked
                            ? "bg-gray-100"
                            : "bg-gray-100",
                      )}
                    >
                      {lesson.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : isLocked ? (
                        <Lock className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Play className="h-5 w-5 text-gray-400" />
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "font-medium",
                          lesson.isCompleted
                            ? "text-emerald-600"
                            : "text-gray-900",
                        )}
                      >
                        {lessonIndex + 1}. {lesson.title}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {contentTypeLabels[
                            lesson.contentType as keyof typeof contentTypeLabels
                          ] || "Contenu"}
                        </span>
                        {lesson.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration} min
                          </span>
                        )}
                        {lesson.isFreePreview && (
                          <Badge variant="secondary" className="text-xs">
                            Apercu gratuit
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Chevron */}
                    {!isLocked && (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
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

export default async function CourseViewerPage({
  params,
  searchParams,
}: PageProps) {
  const { courseId } = await params;
  const { childId } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<CourseViewerSkeleton />}>
      <CourseViewer courseId={courseId} userId={userId} childId={childId} />
    </Suspense>
  );
}
