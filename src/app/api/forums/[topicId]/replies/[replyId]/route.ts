import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { updateReplySchema } from "@/lib/validations/forum";

interface RouteParams {
  params: Promise<{ topicId: string; replyId: string }>;
}

// GET /api/forums/[topicId]/replies/[replyId] - Get a single reply
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { topicId, replyId } = await params;

    const reply = await prisma.forumReply.findFirst({
      where: {
        id: replyId,
        topicId,
        isHidden: false,
      },
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
          },
        },
        _count: {
          select: {
            votes: true,
            childReplies: true,
          },
        },
      },
    });

    if (!reply) {
      return notFound("Reponse non trouvee");
    }

    return NextResponse.json(reply);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/forums/[topicId]/replies/[replyId] - Update a reply
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId, replyId } = await params;
    const body = await req.json();
    const validated = updateReplySchema.parse(body);

    // Get the reply and topic
    const reply = await prisma.forumReply.findFirst({
      where: { id: replyId, topicId },
      include: {
        topic: {
          select: {
            authorId: true,
            isLocked: true,
          },
        },
      },
    });

    if (!reply) {
      return notFound("Reponse non trouvee");
    }

    // Check permissions
    const isReplyAuthor = reply.authorId === session.user.id;
    const isTopicAuthor = reply.topic.authorId === session.user.id;
    const isModerator =
      session.user.role === "ADMIN" || session.user.role === "TEACHER";

    // Authors can update content (if not locked)
    if (validated.content) {
      if (!isReplyAuthor) {
        return forbidden("Seul l'auteur peut modifier le contenu");
      }
      if (reply.topic.isLocked) {
        return forbidden("Ce sujet est verrouille");
      }
    }

    // Topic author or moderators can mark as accepted
    if (validated.isAccepted !== undefined) {
      if (!isTopicAuthor && !isModerator) {
        return forbidden(
          "Seul l'auteur du sujet peut marquer une réponse comme acceptee",
        );
      }
    }

    // Only moderators can hide replies
    if (validated.isHidden !== undefined && !isModerator) {
      return forbidden("Seuls les moderateurs peuvent masquer des réponses");
    }

    // Update the reply
    const updatedReply = await prisma.forumReply.update({
      where: { id: replyId },
      data: {
        ...(validated.content && { content: validated.content }),
        ...(validated.isAccepted !== undefined && {
          isAccepted: validated.isAccepted,
        }),
        ...(validated.isHidden !== undefined && {
          isHidden: validated.isHidden,
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // If marking as accepted, mark topic as resolved
    if (validated.isAccepted === true) {
      await prisma.forumTopic.update({
        where: { id: topicId },
        data: { isResolved: true },
      });
    }

    return NextResponse.json(updatedReply);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/forums/[topicId]/replies/[replyId] - Delete a reply
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId, replyId } = await params;

    // Get the reply
    const reply = await prisma.forumReply.findFirst({
      where: { id: replyId, topicId },
    });

    if (!reply) {
      return notFound("Reponse non trouvee");
    }

    // Check permissions - only author or admin can delete
    const isAuthor = reply.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return forbidden("Vous ne pouvez pas supprimer cette réponse");
    }

    // Delete in a transaction and update reply count
    await prisma.$transaction(async (tx) => {
      // Count replies being deleted (including nested)
      const deleteCount = await tx.forumReply.count({
        where: {
          OR: [{ id: replyId }, { parentReplyId: replyId }],
        },
      });

      // Delete the reply (cascades to child replies and votes)
      await tx.forumReply.delete({
        where: { id: replyId },
      });

      // Update topic reply count
      await tx.forumTopic.update({
        where: { id: topicId },
        data: {
          replyCount: { decrement: deleteCount },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
