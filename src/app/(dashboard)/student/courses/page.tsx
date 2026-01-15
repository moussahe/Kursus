import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, CheckCircle2, Play, Trophy, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

async function getStudentCourses(childId: string) {
  const purchases = await prisma.purchase.findMany({
    where: { childId, status: "COMPLETED" },
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
                orderBy: { position: "asc" },
              },
            },
            orderBy: { position: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const coursesWithProgress = await Promise.all(
    purchases.map(async (purchase) => {
      const course = purchase.course;
      const totalLessons = course.chapters.reduce(
        (sum, ch) => sum + ch.lessons.length,
        0,
      );
      const completedLessons = await prisma.progress.count({
        where: {
          childId,
          isCompleted: true,
          lesson: { chapter: { courseId: course.id } },
        },
      });

      // Find next lesson to continue
      let nextLesson = null;
      for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
          const progress = await prisma.progress.findUnique({
            where: { childId_lessonId: { childId, lessonId: lesson.id } },
          });
          if (!progress?.isCompleted) {
            nextLesson = {
              id: lesson.id,
              title: lesson.title,
              chapterTitle: chapter.title,
            };
            break;
          }
        }
        if (nextLesson) break;
      }

      // Get total quiz average for this course
      const progressWithQuiz = await prisma.progress.findMany({
        where: {
          childId,
          lesson: { chapter: { courseId: course.id } },
          quizScore: { not: null },
        },
        select: { quizScore: true },
      });

      const averageQuizScore =
        progressWithQuiz.length > 0
          ? progressWithQuiz.reduce((sum, p) => sum + (p.quizScore || 0), 0) /
            progressWithQuiz.length
          : null;

      return {
        ...course,
        purchasedAt: purchase.createdAt,
        totalLessons,
        completedLessons,
        progress:
          totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        nextLesson,
        averageQuizScore,
      };
    }),
  );

  return coursesWithProgress;
}

function CoursesSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

async function CoursesList({ childId }: { childId: string }) {
  const courses = await getStudentCourses(childId);

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Aucun cours
        </h2>
        <p className="mt-2 text-gray-500">
          Demande a tes parents d&apos;acheter des cours pour toi !
        </p>
      </div>
    );
  }

  // Separate completed and in-progress courses
  const inProgressCourses = courses.filter((c) => c.progress < 100);
  const completedCourses = courses.filter((c) => c.progress === 100);

  return (
    <div className="space-y-8">
      {/* In Progress */}
      {inProgressCourses.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            En cours ({inProgressCourses.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressCourses.map((course) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex gap-4">
                  {course.imageUrl ? (
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100">
                      <BookOpen className="h-8 w-8 text-violet-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-violet-600">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Par {course.author.name ?? "Anonyme"}
                    </p>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {course.completedLessons}/{course.totalLessons} leçons
                      </p>
                    </div>
                  </div>
                </div>
                {course.nextLesson && (
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-violet-50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Play className="h-4 w-4 text-violet-500" />
                      <span className="text-violet-700">Continuer:</span>
                      <span className="font-medium text-violet-900 truncate">
                        {course.nextLesson.title}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-violet-400" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completedCourses.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Termines ({completedCourses.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/student/courses/${course.id}`}
                className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex gap-4">
                  {course.imageUrl ? (
                    <div className="relative">
                      <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={96}
                        height={96}
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                      <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-green-100">
                      <BookOpen className="h-8 w-8 text-emerald-400" />
                      <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-emerald-600">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Par {course.author.name ?? "Anonyme"}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1">
                        <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700">
                          Termine !
                        </span>
                      </div>
                      {course.averageQuizScore !== null && (
                        <span className="text-sm text-gray-500">
                          Moyenne quiz: {Math.round(course.averageQuizScore)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default async function StudentCoursesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
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
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">Aucun enfant trouve.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Cours</h1>
        <p className="mt-1 text-gray-500">
          Continue ton apprentissage ou revois des leçons.
        </p>
      </div>

      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesList childId={childId} />
      </Suspense>
    </div>
  );
}
