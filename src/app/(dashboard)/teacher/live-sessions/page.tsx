import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Video, Settings, Calendar, Euro, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveSessionCard } from "@/components/live-sessions/session-card";
import { TeacherAvailabilityManager } from "@/components/live-sessions/teacher-availability";
import type { LiveSessionStatus } from "@/types/live-session";

async function getTeacherSessions(userId: string) {
  const [sessions, stats] = await Promise.all([
    prisma.liveSession.findMany({
      where: { teacherId: userId },
      orderBy: { scheduledAt: "asc" },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            image: true,
            teacherProfile: {
              select: {
                headline: true,
                avatarUrl: true,
                averageRating: true,
              },
            },
          },
        },
        child: {
          select: {
            id: true,
            firstName: true,
            gradeLevel: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    // Get stats for this month
    prisma.liveSession.aggregate({
      where: {
        teacherId: userId,
        status: "COMPLETED",
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _count: true,
      _sum: {
        teacherRevenue: true,
        duration: true,
      },
    }),
  ]);

  // Separate upcoming and past sessions
  const upcomingSessions = sessions.filter(
    (s) => s.status === "SCHEDULED" || s.status === "IN_PROGRESS",
  );
  const pastSessions = sessions.filter(
    (s) =>
      s.status === "COMPLETED" ||
      s.status === "CANCELLED" ||
      s.status === "NO_SHOW",
  );

  return {
    upcomingSessions,
    pastSessions,
    stats: {
      sessionsThisMonth: stats._count || 0,
      revenueThisMonth: (stats._sum.teacherRevenue || 0) / 100,
      hoursThisMonth: Math.round((stats._sum.duration || 0) / 60),
    },
  };
}

function SessionsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-2xl" />
      ))}
    </div>
  );
}

async function TeacherSessionsContent({ userId }: { userId: string }) {
  const { upcomingSessions, pastSessions, stats } =
    await getTeacherSessions(userId);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Video className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.sessionsThisMonth}
              </p>
              <p className="text-sm text-gray-500">Sessions ce mois</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Euro className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.revenueThisMonth.toFixed(0)} EUR
              </p>
              <p className="text-sm text-gray-500">Revenus ce mois</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.hoursThisMonth}h
              </p>
              <p className="text-sm text-gray-500">Heures enseignees</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Sessions a venir
        </h2>
        {upcomingSessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 font-medium text-gray-900">
              Aucune session programmee
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Configurez vos disponibilites pour que les parents puissent
              reserver.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcomingSessions.map((session) => (
              <LiveSessionCard
                key={session.id}
                session={{
                  ...session,
                  status: session.status as LiveSessionStatus,
                }}
                userRole="teacher"
              />
            ))}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Sessions passees
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pastSessions.slice(0, 4).map((session) => (
              <LiveSessionCard
                key={session.id}
                session={{
                  ...session,
                  status: session.status as LiveSessionStatus,
                }}
                userRole="teacher"
              />
            ))}
          </div>
          {pastSessions.length > 4 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/teacher/live-sessions/history">
                  Voir tout l&apos;historique
                </Link>
              </Button>
            </div>
          )}
        </section>
      )}

      {/* Availability Manager */}
      <section>
        <TeacherAvailabilityManager />
      </section>
    </div>
  );
}

export default async function TeacherLiveSessionsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sessions en Direct
          </h1>
          <p className="mt-1 text-gray-500">
            Gerez vos cours particuliers en video
          </p>
        </div>
        <Link href="/teacher/live-sessions/settings">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Parametres
          </Button>
        </Link>
      </div>

      {/* Content */}
      <Suspense fallback={<SessionsSkeleton />}>
        <TeacherSessionsContent userId={userId} />
      </Suspense>
    </div>
  );
}
