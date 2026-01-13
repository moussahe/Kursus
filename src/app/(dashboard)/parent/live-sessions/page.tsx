import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Video, Plus, Calendar, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LiveSessionCard } from "@/components/live-sessions/session-card";
import type { LiveSessionStatus } from "@/types/live-session";

async function getParentSessions(userId: string) {
  const sessions = await prisma.liveSession.findMany({
    where: { parentId: userId },
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
    },
  });

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

  return { upcomingSessions, pastSessions };
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

async function LiveSessionsList({ userId }: { userId: string }) {
  const { upcomingSessions, pastSessions } = await getParentSessions(userId);

  return (
    <div className="space-y-8">
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
              Reservez une session avec un professeur pour obtenir de
              l&apos;aide personnalisee.
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
                userRole="parent"
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
            {pastSessions.slice(0, 6).map((session) => (
              <LiveSessionCard
                key={session.id}
                session={{
                  ...session,
                  status: session.status as LiveSessionStatus,
                }}
                userRole="parent"
              />
            ))}
          </div>
          {pastSessions.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/parent/live-sessions/history">
                  Voir tout l&apos;historique
                </Link>
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default async function ParentLiveSessionsPage() {
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
            Cours particuliers en video avec des professeurs certifies
          </p>
        </div>
        <Link href="/parent/live-sessions/book">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" />
            Reserver une session
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">Cours particuliers en video</h3>
            <p className="mt-1 text-sm text-violet-100">
              Reservez une session avec un professeur certifie pour obtenir de
              l&apos;aide personnalisee. Sessions de 30 min a 2h, adaptees au
              niveau de votre enfant.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Sessions flexibles
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                Toutes matieres
              </span>
              <span className="flex items-center gap-1">
                <Video className="h-4 w-4" />
                Video HD
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <Suspense fallback={<SessionsSkeleton />}>
        <LiveSessionsList userId={userId} />
      </Suspense>
    </div>
  );
}
