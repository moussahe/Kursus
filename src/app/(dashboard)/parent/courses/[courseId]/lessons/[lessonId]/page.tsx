import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LessonContent } from "@/components/parent/lesson-content";
import { MarkCompleteButton } from "@/components/parent/mark-complete-button";

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
  searchParams: Promise<{
    childId?: string;
  }>;
}

async function getLessonWithNavigation(
  courseId: string,
  lessonId: string,
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

  // Get the lesson
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      chapter: {
        courseId,
        isPublished: true,
      },
      isPublished: true,
    },
    include: {
      chapter: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      quizzes: {
        include: {
          questions: {
            orderBy: { position: "asc" },
          },
        },
      },
      resources: true,
    },
  });

  if (!lesson) {
    return null;
  }

  // Get progress for this lesson
  let progress = null;
  if (childId) {
    progress = await prisma.progress.findUnique({
      where: {
        childId_lessonId: {
          childId,
          lessonId,
        },
      },
    });
  }

  // Get all lessons in the course for navigation
  const allLessons = await prisma.lesson.findMany({
    where: {
      chapter: {
        courseId,
        isPublished: true,
      },
      isPublished: true,
    },
    include: {
      chapter: {
        select: {
          position: true,
        },
      },
    },
    orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }],
  });

  // Find current lesson index and get prev/next
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    lesson,
    progress,
    navigation: {
      current: currentIndex + 1,
      total: allLessons.length,
      prev: prevLesson,
      next: nextLesson,
    },
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

function LessonViewerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  );
}

async function LessonViewer({
  courseId,
  lessonId,
  userId,
  childId,
}: {
  courseId: string;
  lessonId: string;
  userId: string;
  childId?: string;
}) {
  const data = await getLessonWithNavigation(
    courseId,
    lessonId,
    userId,
    childId,
  );

  if (!data) {
    notFound();
  }

  const { lesson, progress, navigation } = data;
  const Icon =
    contentTypeIcons[lesson.contentType as keyof typeof contentTypeIcons] ||
    FileText;
  const typeLabel =
    contentTypeLabels[lesson.contentType as keyof typeof contentTypeLabels] ||
    "Contenu";

  return (
    <div className="space-y-6">
      {/* Back to Course */}
      <Button variant="ghost" asChild className="gap-2">
        <Link
          href={`/parent/courses/${courseId}${childId ? `?childId=${childId}` : ""}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au cours
        </Link>
      </Button>

      {/* Lesson Header */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{lesson.chapter.course.title}</span>
              <span>-</span>
              <span>{lesson.chapter.title}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {lesson.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600"
              >
                <Icon className="h-3.5 w-3.5" />
                {typeLabel}
              </Badge>
              {lesson.duration && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {lesson.duration} min
                </span>
              )}
              <span className="text-sm text-gray-500">
                Lecon {navigation.current} sur {navigation.total}
              </span>
            </div>
          </div>

          {/* Completion Status */}
          {progress?.isCompleted ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Termine</span>
            </div>
          ) : childId ? (
            <MarkCompleteButton lessonId={lessonId} childId={childId} />
          ) : null}
        </div>
      </div>

      {/* Lesson Content */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <LessonContent
          lesson={{
            id: lesson.id,
            title: lesson.title,
            content: lesson.content,
            contentType: lesson.contentType,
            videoUrl: lesson.videoUrl,
            quizzes: lesson.quizzes.map((quiz) => ({
              id: quiz.id,
              title: quiz.title,
              description: quiz.description,
              passingScore: quiz.passingScore,
              questions: quiz.questions.map((q) => ({
                id: q.id,
                question: q.question,
                options: q.options as {
                  id: string;
                  text: string;
                  isCorrect: boolean;
                }[],
                explanation: q.explanation,
                points: q.points,
              })),
            })),
            resources: lesson.resources,
          }}
          childId={childId}
          currentProgress={progress}
        />
      </div>

      {/* Resources */}
      {lesson.resources.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Ressources
          </h2>
          <div className="space-y-2">
            {lesson.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50"
              >
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="flex-1 font-medium text-gray-900">
                  {resource.title}
                </span>
                <Badge variant="outline">{resource.type.toUpperCase()}</Badge>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        {navigation.prev ? (
          <Button variant="outline" asChild className="gap-2">
            <Link
              href={`/parent/courses/${courseId}/lessons/${navigation.prev.id}${
                childId ? `?childId=${childId}` : ""
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Lecon precedente</span>
              <span className="sm:hidden">Prec.</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        <span className="text-sm text-gray-500">
          {navigation.current} / {navigation.total}
        </span>

        {navigation.next ? (
          <Button asChild className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Link
              href={`/parent/courses/${courseId}/lessons/${navigation.next.id}${
                childId ? `?childId=${childId}` : ""
              }`}
            >
              <span className="hidden sm:inline">Lecon suivante</span>
              <span className="sm:hidden">Suiv.</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Link
              href={`/parent/courses/${courseId}${childId ? `?childId=${childId}` : ""}`}
            >
              Terminer
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default async function LessonViewerPage({
  params,
  searchParams,
}: PageProps) {
  const { courseId, lessonId } = await params;
  const { childId } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <Suspense fallback={<LessonViewerSkeleton />}>
      <LessonViewer
        courseId={courseId}
        lessonId={lessonId}
        userId={userId}
        childId={childId}
      />
    </Suspense>
  );
}
