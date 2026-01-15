import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ArrowLeft,
  MessageSquare,
  Eye,
  Pin,
  Lock,
  CheckCircle2,
  GraduationCap,
  Share2,
  Flag,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReplyCard } from "@/components/forums/reply-card";
import { ReplyForm } from "@/components/forums/reply-form";
import { TopicActions } from "./topic-actions";
import {
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from "@/lib/validations/forum";

const gradeLevelLabels: Record<string, string> = {
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

async function getTopic(topicId: string) {
  const topic = await prisma.forumTopic.findUnique({
    where: { id: topicId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
          teacherProfile: {
            select: {
              headline: true,
              isVerified: true,
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
      replies: {
        where: { isHidden: false, parentReplyId: null },
        orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
              teacherProfile: {
                select: {
                  headline: true,
                  isVerified: true,
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
          childReplies: {
            where: { isHidden: false },
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  role: true,
                },
              },
              child: {
                select: {
                  id: true,
                  firstName: true,
                },
              },
            },
          },
          _count: {
            select: {
              votes: true,
              childReplies: true,
            },
          },
        },
      },
    },
  });

  if (topic) {
    // Increment view count
    await prisma.forumTopic.update({
      where: { id: topicId },
      data: { viewCount: { increment: 1 } },
    });
  }

  return topic;
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const [topic, session] = await Promise.all([getTopic(topicId), auth()]);

  if (!topic) {
    notFound();
  }

  const displayName = topic.child
    ? topic.child.firstName
    : topic.author.name || "Anonyme";
  const isTeacher = topic.author.role === "TEACHER";
  const isAuthor = topic.author.id === session?.user?.id;
  const isModerator =
    session?.user?.role === "ADMIN" || session?.user?.role === "TEACHER";

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Back button */}
          <Link
            href="/community"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux discussions
          </Link>

          {/* Topic header */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {topic.isPinned && (
              <Badge variant="secondary" className="bg-emerald-100">
                <Pin className="h-3 w-3 mr-1" />
                Epingle
              </Badge>
            )}
            {topic.isLocked && (
              <Badge variant="secondary">
                <Lock className="h-3 w-3 mr-1" />
                Verrouille
              </Badge>
            )}
            {topic.isResolved && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Resolu
              </Badge>
            )}
            <Badge variant="outline">
              {FORUM_CATEGORY_LABELS[topic.category as ForumCategory]}
            </Badge>
            {topic.subject && (
              <Badge variant="outline">
                {subjectLabels[topic.subject] || topic.subject}
              </Badge>
            )}
            {topic.gradeLevel && (
              <Badge variant="outline">
                {gradeLevelLabels[topic.gradeLevel] || topic.gradeLevel}
              </Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground">{topic.title}</h1>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {topic.author.image ? (
                <Image
                  src={topic.author.image}
                  alt={displayName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-xs font-medium text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium text-foreground">{displayName}</span>
              {isTeacher && (
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              )}
            </div>
            <span>
              Publie{" "}
              {formatDistanceToNow(new Date(topic.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {topic.replyCount} réponse{topic.replyCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {topic.viewCount} vue{topic.viewCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Topic content */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="prose prose-emerald max-w-none">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Partager
              </Button>
              <Button variant="ghost" size="sm">
                <Flag className="h-4 w-4 mr-1" />
                Signaler
              </Button>
            </div>

            {(isAuthor || isModerator) && (
              <TopicActions
                topicId={topic.id}
                isAuthor={isAuthor}
                isModerator={isModerator}
                isPinned={topic.isPinned}
                isLocked={topic.isLocked}
              />
            )}
          </div>
        </div>

        {/* Replies section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">
            {topic.replyCount} Reponse{topic.replyCount !== 1 ? "s" : ""}
          </h2>

          {/* Reply form (if not locked) */}
          {session?.user && !topic.isLocked && (
            <div className="bg-white rounded-lg border p-4">
              <ReplyForm topicId={topic.id} />
            </div>
          )}

          {!session?.user && (
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-muted-foreground mb-3">
                Connectez-vous pour participer a la discussion
              </p>
              <Link href="/login">
                <Button>Se connecter</Button>
              </Link>
            </div>
          )}

          {topic.isLocked && (
            <div className="bg-muted/50 rounded-lg p-4 text-center text-muted-foreground">
              <Lock className="h-5 w-5 mx-auto mb-2" />
              Ce sujet est verrouille. Les nouvelles réponses sont desactivees.
            </div>
          )}

          {/* Replies list */}
          <div className="space-y-4">
            {topic.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={{
                  ...reply,
                  createdAt: reply.createdAt.toISOString(),
                  childReplies: reply.childReplies.map((cr) => ({
                    ...cr,
                    createdAt: cr.createdAt.toISOString(),
                    isAccepted: false,
                    voteScore: 0,
                  })),
                }}
                topicId={topic.id}
                topicAuthorId={topic.author.id}
                currentUserId={session?.user?.id}
                currentUserRole={session?.user?.role}
              />
            ))}
          </div>

          {topic.replies.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucune réponse pour le moment.</p>
              <p className="text-sm">Soyez le premier a repondre!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
