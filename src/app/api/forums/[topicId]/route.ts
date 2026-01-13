import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { updateTopicSchema } from "@/lib/validations/forum";

interface RouteParams {
  params: Promise<{ topicId: string }>;
}

// GET /api/forums/[topicId] - Get a single topic with replies
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { topicId } = await params;

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
          where: { isHidden: false },
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
            _count: {
              select: {
                votes: true,
                childReplies: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
            votes: true,
          },
        },
      },
    });

    if (!topic) {
      return notFound("Sujet non trouve");
    }

    // Increment view count (fire and forget)
    prisma.forumTopic
      .update({
        where: { id: topicId },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {
        // Silently fail - view count is not critical
      });

    return NextResponse.json(topic);
  } catch (error) {
    return handleApiError(error);
  }
}

// PATCH /api/forums/[topicId] - Update a topic
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId } = await params;
    const body = await req.json();
    const validated = updateTopicSchema.parse(body);

    // Get the topic
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return notFound("Sujet non trouve");
    }

    // Check permissions
    const isAuthor = topic.authorId === session.user.id;
    const isModerator =
      session.user.role === "ADMIN" || session.user.role === "TEACHER";

    // Authors can update content, moderators can pin/lock/resolve
    if (!isAuthor && !isModerator) {
      return forbidden("Vous ne pouvez pas modifier ce sujet");
    }

    // Only authors can update content
    if ((validated.title || validated.content) && !isAuthor) {
      return forbidden("Seul l'auteur peut modifier le contenu");
    }

    // Only moderators can pin/lock
    if (
      (validated.isPinned !== undefined || validated.isLocked !== undefined) &&
      !isModerator
    ) {
      return forbidden("Seuls les moderateurs peuvent epingler ou verrouiller");
    }

    // Update the topic
    const updatedTopic = await prisma.forumTopic.update({
      where: { id: topicId },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.content && { content: validated.content }),
        ...(validated.isPinned !== undefined && {
          isPinned: validated.isPinned,
        }),
        ...(validated.isLocked !== undefined && {
          isLocked: validated.isLocked,
        }),
        ...(validated.isResolved !== undefined && {
          isResolved: validated.isResolved,
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

    return NextResponse.json(updatedTopic);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/forums/[topicId] - Delete a topic
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId } = await params;

    // Get the topic
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return notFound("Sujet non trouve");
    }

    // Check permissions - only author or admin can delete
    const isAuthor = topic.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return forbidden("Vous ne pouvez pas supprimer ce sujet");
    }

    // Delete the topic (cascades to replies and votes)
    await prisma.forumTopic.delete({
      where: { id: topicId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
