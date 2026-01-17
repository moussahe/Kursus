import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ConversationsClient } from "./conversations-client";

export const metadata = {
  title: "Conversations IA | Kursus",
  description: "Historique des conversations avec l'assistant IA",
};

export default async function ConversationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Recuperer les enfants du parent
  const children = await prisma.child.findMany({
    where: { parentId: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      gradeLevel: true,
      _count: {
        select: { conversations: true },
      },
    },
    orderBy: { firstName: "asc" },
  });

  // Recuperer les conversations de tous les enfants
  const conversations = await prisma.aIConversation.findMany({
    where: {
      child: {
        parentId: session.user.id,
      },
    },
    include: {
      child: {
        select: {
          id: true,
          firstName: true,
          gradeLevel: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          content: true,
          role: true,
          createdAt: true,
        },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const formattedConversations = conversations.map((c) => ({
    id: c.id,
    title: c.title || "Nouvelle conversation",
    childId: c.childId,
    childName: c.child.firstName,
    childGrade: c.child.gradeLevel,
    courseId: c.courseId,
    lessonId: c.lessonId,
    messageCount: c._count.messages,
    lastMessage: c.messages[0]
      ? {
          content: c.messages[0].content,
          role: c.messages[0].role,
          createdAt: c.messages[0].createdAt.toISOString(),
        }
      : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return (
    <ConversationsClient
      childrenData={children.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName || undefined,
        gradeLevel: c.gradeLevel,
        conversationCount: c._count.conversations,
      }))}
      initialConversations={formattedConversations}
    />
  );
}
