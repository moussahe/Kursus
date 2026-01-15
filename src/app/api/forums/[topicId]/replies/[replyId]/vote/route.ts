import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  notFound,
  badRequest,
} from "@/lib/api-error";
import { voteSchema } from "@/lib/validations/forum";

interface RouteParams {
  params: Promise<{ topicId: string; replyId: string }>;
}

// POST /api/forums/[topicId]/replies/[replyId]/vote - Vote on a reply
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId, replyId } = await params;
    const body = await req.json();
    const validated = voteSchema.parse(body);

    // Verify reply exists
    const reply = await prisma.forumReply.findFirst({
      where: { id: replyId, topicId },
      select: { id: true, authorId: true },
    });

    if (!reply) {
      return notFound("Reponse non trouvee");
    }

    // Can't vote on own replies
    if (reply.authorId === session.user.id) {
      return badRequest("Vous ne pouvez pas voter pour votre propre réponse");
    }

    if (validated.value === 0) {
      // Remove vote and update score
      const existingVote = await prisma.forumVote.findUnique({
        where: {
          userId_replyId: {
            userId: session.user.id,
            replyId,
          },
        },
      });

      if (existingVote) {
        await prisma.$transaction([
          prisma.forumVote.delete({
            where: { id: existingVote.id },
          }),
          prisma.forumReply.update({
            where: { id: replyId },
            data: { voteScore: { decrement: existingVote.value } },
          }),
        ]);
      }

      return NextResponse.json({ voted: false, value: 0 });
    }

    // Get existing vote to calculate score change
    const existingVote = await prisma.forumVote.findUnique({
      where: {
        userId_replyId: {
          userId: session.user.id,
          replyId,
        },
      },
    });

    const scoreChange = existingVote
      ? validated.value - existingVote.value
      : validated.value;

    // Upsert vote and update score in transaction
    const [vote] = await prisma.$transaction([
      prisma.forumVote.upsert({
        where: {
          userId_replyId: {
            userId: session.user.id,
            replyId,
          },
        },
        update: {
          value: validated.value,
        },
        create: {
          userId: session.user.id,
          replyId,
          value: validated.value,
        },
      }),
      prisma.forumReply.update({
        where: { id: replyId },
        data: { voteScore: { increment: scoreChange } },
      }),
    ]);

    return NextResponse.json({ voted: true, value: vote.value });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/forums/[topicId]/replies/[replyId]/vote - Get current user's vote
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ voted: false, value: 0 });
    }

    const { replyId } = await params;

    const vote = await prisma.forumVote.findUnique({
      where: {
        userId_replyId: {
          userId: session.user.id,
          replyId,
        },
      },
    });

    return NextResponse.json({
      voted: !!vote,
      value: vote?.value || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
