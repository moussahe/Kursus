import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
} from "@/lib/api-error";
import { createReplySchema, repliesQuerySchema } from "@/lib/validations/forum";

interface RouteParams {
  params: Promise<{ topicId: string }>;
}

// GET /api/forums/[topicId]/replies - List replies for a topic
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { topicId } = await params;
    const { searchParams } = new URL(req.url);
    const query = repliesQuerySchema.parse(Object.fromEntries(searchParams));
    const { sortBy, page, limit } = query;
    const skip = (page - 1) * limit;

    // Verify topic exists
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      return notFound("Sujet non trouve");
    }

    // Build order by
    type OrderBy =
      | { createdAt: "asc" }
      | { createdAt: "desc" }
      | { voteScore: "desc" };

    let orderBy: OrderBy;
    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "best":
        orderBy = { voteScore: "desc" };
        break;
      default:
        orderBy = { createdAt: "asc" };
    }

    const [replies, total] = await prisma.$transaction([
      prisma.forumReply.findMany({
        where: {
          topicId,
          isHidden: false,
          parentReplyId: null, // Only top-level replies
        },
        skip,
        take: limit,
        orderBy: [{ isAccepted: "desc" }, orderBy],
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
      }),
      prisma.forumReply.count({
        where: { topicId, isHidden: false, parentReplyId: null },
      }),
    ]);

    return NextResponse.json({
      data: replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/forums/[topicId]/replies - Create a reply
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId } = await params;
    const body = await req.json();
    const validated = createReplySchema.parse(body);

    // Verify topic exists and is not locked
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        isLocked: true,
        category: true,
        authorId: true,
      },
    });

    if (!topic) {
      return notFound("Sujet non trouve");
    }

    if (topic.isLocked) {
      return forbidden("Ce sujet est verrouille");
    }

    // Check category access
    if (
      topic.category === "TEACHER_LOUNGE" &&
      session.user.role !== "TEACHER" &&
      session.user.role !== "ADMIN"
    ) {
      return forbidden(
        "Seuls les enseignants peuvent repondre dans cet espace",
      );
    }

    // If replying to another reply, verify it exists
    if (validated.parentReplyId) {
      const parentReply = await prisma.forumReply.findFirst({
        where: {
          id: validated.parentReplyId,
          topicId,
          isHidden: false,
        },
      });

      if (!parentReply) {
        return badRequest("Reponse parente non trouvee");
      }
    }

    // If posting on behalf of a child, verify ownership
    if (validated.childId) {
      const child = await prisma.child.findFirst({
        where: {
          id: validated.childId,
          parentId: session.user.id,
        },
      });

      if (!child) {
        return badRequest("Enfant non trouve ou non autorise");
      }
    }

    // Create the reply and update topic stats in a transaction
    const reply = await prisma.$transaction(async (tx) => {
      const newReply = await tx.forumReply.create({
        data: {
          topicId,
          content: validated.content,
          authorId: session.user.id,
          authorType: session.user.role,
          childId: validated.childId,
          parentReplyId: validated.parentReplyId,
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
          child: {
            select: {
              id: true,
              firstName: true,
              gradeLevel: true,
            },
          },
        },
      });

      // Update topic stats
      await tx.forumTopic.update({
        where: { id: topicId },
        data: {
          replyCount: { increment: 1 },
          lastReplyAt: new Date(),
          lastReplyBy: session.user.id,
        },
      });

      return newReply;
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
