import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChildCard } from "@/components/parent/child-card";
import { ChildFormDialog } from "@/components/parent/child-form-dialog";

async function getChildrenWithStats(userId: string) {
  const children = await prisma.child.findMany({
    where: { parentId: userId },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        include: {
          course: {
            include: {
              chapters: {
                where: { isPublished: true },
                include: {
                  lessons: {
                    where: { isPublished: true },
                  },
                },
              },
            },
          },
        },
      },
      progress: {
        where: { isCompleted: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return children.map((child) => {
    const coursesCount = child.purchases.length;

    // Calculate total lessons and completed lessons
    let totalLessons = 0;
    let completedLessons = 0;

    child.purchases.forEach((purchase) => {
      purchase.course.chapters.forEach((chapter) => {
        totalLessons += chapter.lessons.length;
      });
    });

    completedLessons = child.progress.length;

    const progress =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      ...child,
      coursesCount,
      progress,
    };
  });
}

function ChildrenListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-2 h-4 w-20" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="mt-4 h-3 rounded-full" />
        </div>
      ))}
    </div>
  );
}

async function ChildrenList({ userId }: { userId: string }) {
  const children = await getChildrenWithStats(userId);

  if (children.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Users className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="mt-6 text-lg font-semibold text-gray-900">
          Aucun enfant ajoute
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Commencez par ajouter un enfant pour suivre sa progression scolaire.
        </p>
        <div className="mt-6">
          <ChildFormDialog />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {children.map((child) => (
        <ChildCard
          key={child.id}
          child={child}
          coursesCount={child.coursesCount}
          overallProgress={child.progress}
        />
      ))}
    </div>
  );
}

export default async function ChildrenPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Enfants</h1>
          <p className="mt-1 text-gray-500">
            Gerez les profils de vos enfants et suivez leur progression.
          </p>
        </div>
        <ChildFormDialog />
      </div>

      {/* Children List */}
      <Suspense fallback={<ChildrenListSkeleton />}>
        <ChildrenList userId={userId} />
      </Suspense>

      {/* Tips Section */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Conseil du jour</h3>
            <p className="mt-1 text-emerald-50">
              Encouragez vos enfants a etudier regulierement. 15-30 minutes par
              jour sont plus efficaces que de longues sessions espacees !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
