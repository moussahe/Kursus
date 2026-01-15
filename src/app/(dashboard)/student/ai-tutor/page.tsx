import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  BookOpen,
  History,
  MessageSquare,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AIChat } from "@/components/ai/ai-chat";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Map grade level to display name
const GRADE_LABELS: Record<string, string> = {
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

// Map subject to display name
const SUBJECT_LABELS: Record<string, string> = {
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

interface ConversationWithDetails {
  id: string;
  title: string | null;
  courseId: string | null;
  lessonId: string | null;
  updatedAt: Date;
  messageCount: number;
  courseTitle?: string;
  courseSubject?: string;
  lessonTitle?: string;
}

async function getChildData(childId: string) {
  const [child, rawConversations, purchasedCourses] = await Promise.all([
    prisma.child.findUnique({
      where: { id: childId },
      select: {
        id: true,
        firstName: true,
        gradeLevel: true,
        xp: true,
        level: true,
      },
    }),
    prisma.aIConversation.findMany({
      where: { childId },
      include: {
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.purchase.findMany({
      where: { childId, status: "COMPLETED" },
      include: {
        course: {
          select: { id: true, title: true, subject: true },
        },
      },
    }),
  ]);

  // Fetch course and lesson details for conversations
  const recentConversations: ConversationWithDetails[] = await Promise.all(
    rawConversations.map(async (conv) => {
      let courseTitle: string | undefined;
      let courseSubject: string | undefined;
      let lessonTitle: string | undefined;

      if (conv.courseId) {
        const course = await prisma.course.findUnique({
          where: { id: conv.courseId },
          select: { title: true, subject: true },
        });
        if (course) {
          courseTitle = course.title;
          courseSubject = course.subject;
        }
      }

      if (conv.lessonId) {
        const lesson = await prisma.lesson.findUnique({
          where: { id: conv.lessonId },
          select: { title: true },
        });
        if (lesson) {
          lessonTitle = lesson.title;
        }
      }

      return {
        id: conv.id,
        title: conv.title,
        courseId: conv.courseId,
        lessonId: conv.lessonId,
        updatedAt: conv.updatedAt,
        messageCount: conv._count.messages,
        courseTitle,
        courseSubject,
        lessonTitle,
      };
    }),
  );

  return { child, recentConversations, purchasedCourses };
}

function AITutorSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-[500px] rounded-2xl lg:col-span-2" />
        <Skeleton className="h-[500px] rounded-2xl" />
      </div>
    </div>
  );
}

async function AITutorContent({
  childId,
  conversationId,
}: {
  childId: string;
  conversationId?: string;
}) {
  const { child, recentConversations, purchasedCourses } =
    await getChildData(childId);

  if (!child) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-gray-500">Erreur de chargement des donnees.</p>
      </div>
    );
  }

  // Get unique subjects from purchased courses
  const subjects = Array.from(
    new Set(purchasedCourses.map((p) => p.course.subject)),
  );

  // If resuming a conversation, get its context
  let chatCourseId: string | undefined;
  let chatLessonId: string | undefined;
  let chatContext: {
    level: string;
    subject: string;
    courseTitle?: string;
    lessonTitle?: string;
  } = {
    level: GRADE_LABELS[child.gradeLevel] || child.gradeLevel,
    subject: "Aide aux devoirs",
  };

  if (conversationId) {
    const conv = recentConversations.find((c) => c.id === conversationId);
    if (conv) {
      chatContext = {
        level: GRADE_LABELS[child.gradeLevel] || child.gradeLevel,
        subject: conv.courseSubject
          ? SUBJECT_LABELS[conv.courseSubject] || conv.courseSubject
          : "Aide aux devoirs",
        courseTitle: conv.courseTitle,
        lessonTitle: conv.lessonTitle,
      };
      chatCourseId = conv.courseId || undefined;
      chatLessonId = conv.lessonId || undefined;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/student">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-200" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Assistant IA</h1>
            <p className="text-sm text-gray-500">
              Pose tes questions, je t&apos;aide a comprendre
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="h-4 w-4 text-amber-500" />
          <span>{child.xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Ton tuteur personnel</h2>
              <p className="text-sm text-violet-100">
                Je t&apos;aide a comprendre tes cours sans te donner les
                réponses directement
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">24/7 disponible</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Toutes matieres</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Area */}
        <div className="lg:col-span-2">
          <AIChat
            context={chatContext}
            childId={child.id}
            courseId={chatCourseId}
            lessonId={chatLessonId}
            conversationId={conversationId}
            className="h-[500px]"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Conversations */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                <History className="h-4 w-4" />
                Conversations recentes
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/student/ai-tutor">
                  <Plus className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {recentConversations.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  Aucune conversation
                </p>
                <p className="text-xs text-gray-400">
                  Commence a poser des questions !
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {recentConversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/student/ai-tutor?conversation=${conv.id}`}
                    className={`block rounded-xl border p-3 transition-colors hover:bg-gray-50 ${
                      conversationId === conv.id
                        ? "border-violet-300 bg-violet-50"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {conv.courseTitle ||
                            conv.title ||
                            "Discussion générale"}
                        </p>
                        {conv.lessonTitle && (
                          <p className="truncate text-xs text-gray-500">
                            {conv.lessonTitle}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {conv.messageCount} messages •{" "}
                          {formatDistanceToNow(new Date(conv.updatedAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access - Subjects */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900">Acces rapide</h3>
            <p className="text-xs text-gray-500">
              Pose une question sur une matiere
            </p>

            {subjects.length === 0 ? (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Aucun cours achete pour le moment
                </p>
                <p className="text-xs text-gray-400">
                  L&apos;assistant peut quand meme t&apos;aider !
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <span
                    key={subject}
                    className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700"
                  >
                    {SUBJECT_LABELS[subject] || subject}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="rounded-2xl bg-gray-50 p-5">
            <h3 className="font-semibold text-gray-900">Conseils</h3>
            <ul className="mt-3 space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-violet-500">•</span>
                <span>Decris ton problème le plus precisement possible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500">•</span>
                <span>
                  N&apos;hesite pas a demander plus d&apos;explications
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500">•</span>
                <span>
                  Je te guide vers la solution, je ne te donne pas la réponse
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-500">•</span>
                <span>
                  Tu peux me poser des questions sur n&apos;importe quelle
                  matiere
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AITutorPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const conversationId = params.conversation;

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
    <Suspense fallback={<AITutorSkeleton />}>
      <AITutorContent childId={childId} conversationId={conversationId} />
    </Suspense>
  );
}
