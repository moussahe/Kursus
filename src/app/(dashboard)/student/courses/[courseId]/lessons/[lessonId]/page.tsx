import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonContent } from "@/components/student/lesson-content";
import { QuizSection } from "@/components/quiz/quiz-section";
import { ExerciseSection } from "@/components/exercise";
import { AITutorPanel } from "@/components/student/ai-tutor-panel";

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

async function getLessonDetails(
  lessonId: string,
  childId: string,
  courseId: string,
) {
  // Verify the child has access to this course
  const purchase = await prisma.purchase.findFirst({
    where: {
      courseId,
      childId,
      status: "COMPLETED",
    },
  });

  if (!purchase) return null;

  // Get the lesson with its quiz
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: true,
        },
      },
      quizzes: {
        include: {
          questions: {
            orderBy: { position: "asc" },
          },
        },
        take: 1,
      },
      resources: true,
    },
  });

  if (!lesson || lesson.chapter.courseId !== courseId) return null;

  // Get progress for this lesson
  const progress = await prisma.progress.findUnique({
    where: { childId_lessonId: { childId, lessonId } },
  });

  // Get all lessons in order to find prev/next
  const allLessons = await prisma.lesson.findMany({
    where: {
      chapter: { courseId },
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      position: true,
      chapter: {
        select: { position: true },
      },
    },
    orderBy: [{ chapter: { position: "asc" } }, { position: "asc" }],
  });

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    lesson,
    progress,
    quiz: lesson.quizzes[0] ?? null,
    prevLesson,
    nextLesson,
    course: lesson.chapter.course,
    chapterTitle: lesson.chapter.title,
    totalLessons: allLessons.length,
    currentPosition: currentIndex + 1,
  };
}

function LessonSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-24 rounded-2xl" />
    </div>
  );
}

async function LessonViewer({
  lessonId,
  childId,
  courseId,
}: {
  lessonId: string;
  childId: string;
  courseId: string;
}) {
  const data = await getLessonDetails(lessonId, childId, courseId);

  if (!data) {
    notFound();
  }

  const {
    lesson,
    progress,
    quiz,
    prevLesson,
    nextLesson,
    course,
    chapterTitle,
    totalLessons,
    currentPosition,
  } = data;

  const isCompleted = progress?.isCompleted ?? false;
  const quizScore = progress?.quizScore ?? null;

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href={`/student/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <p className="text-sm text-gray-500">{course.title}</p>
            <p className="text-xs text-gray-400">{chapterTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>
            Lecon {currentPosition} sur {totalLessons}
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              Terminee
            </span>
          )}
        </div>
      </div>

      {/* Lesson Title */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            {lesson.description && (
              <p className="mt-2 text-gray-600">{lesson.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              {lesson.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {lesson.duration} min
                </span>
              )}
              {quiz && (
                <span className="flex items-center gap-1">
                  <HelpCircle className="h-4 w-4" />
                  Quiz inclus
                </span>
              )}
            </div>
          </div>
          {isCompleted && quizScore !== null && (
            <div
              className={cn(
                "rounded-xl px-4 py-2 text-center",
                quizScore >= 70 ? "bg-emerald-100" : "bg-orange-100",
              )}
            >
              <p className="text-xs text-gray-500">Score quiz</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  quizScore >= 70 ? "text-emerald-700" : "text-orange-700",
                )}
              >
                {quizScore}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Content */}
      <LessonContent
        lesson={{
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType,
          videoUrl: lesson.videoUrl,
        }}
        childId={childId}
        isCompleted={isCompleted}
      />

      {/* Quiz Section */}
      {quiz && (
        <QuizSection
          quiz={{
            id: quiz.id,
            title: quiz.title,
            description: quiz.description,
            passingScore: quiz.passingScore,
            questions: quiz.questions.map(
              (q: {
                id: string;
                question: string;
                options: unknown;
                explanation: string | null;
                points: number;
              }) => ({
                id: q.id,
                question: q.question,
                options: q.options as Array<{
                  id: string;
                  text: string;
                  isCorrect: boolean;
                }>,
                explanation: q.explanation,
                points: q.points,
              }),
            ),
          }}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          subject={course.subject}
          gradeLevel={course.gradeLevel}
          childId={childId}
          previousScore={quizScore}
        />
      )}

      {/* Generative Exercises Section */}
      <ExerciseSection
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        subject={course.subject}
        childId={childId}
      />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
        {prevLesson ? (
          <Button variant="outline" asChild className="gap-2">
            <Link
              href={`/student/courses/${courseId}/lessons/${prevLesson.id}`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Precedent</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        <Button
          variant="outline"
          asChild
          className="gap-2 text-violet-600 border-violet-200 hover:bg-violet-50"
        >
          <Link href={`/student/courses/${courseId}`}>
            <BookOpen className="h-4 w-4" />
            Sommaire
          </Link>
        </Button>

        {nextLesson ? (
          <Button asChild className="gap-2 bg-violet-600 hover:bg-violet-700">
            <Link
              href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
            >
              <span className="hidden sm:inline">Suivant</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Link href={`/student/courses/${courseId}`}>
              <CheckCircle2 className="h-4 w-4" />
              Terminer
            </Link>
          </Button>
        )}
      </div>

      {/* AI Tutor Panel - Floating assistant */}
      <AITutorPanel
        context={{
          level: course.gradeLevel,
          subject: course.subject,
          courseTitle: course.title,
          lessonTitle: lesson.title,
          chapterTitle,
        }}
        childId={childId}
        courseId={course.id}
        lessonId={lesson.id}
      />
    </div>
  );
}

export default async function StudentLessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;
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
    <Suspense fallback={<LessonSkeleton />}>
      <LessonViewer lessonId={lessonId} childId={childId} courseId={courseId} />
    </Suspense>
  );
}
