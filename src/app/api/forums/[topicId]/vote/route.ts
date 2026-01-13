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
  params: Promise<{ topicId: string }>;
}

// POST /api/forums/[topicId]/vote - Vote on a topic
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const { topicId } = await params;
    const body = await req.json();
    const validated = voteSchema.parse(body);

    // Verify topic exists
    const topic = await prisma.forumTopic.findUnique({
      where: { id: topicId },
      select: { id: true, authorId: true },
    });

    if (!topic) {
      return notFound("Sujet non trouve");
    }

    // Can't vote on own topics
    if (topic.authorId === session.user.id) {
      return badRequest("Vous ne pouvez pas voter pour votre propre sujet");
    }

    if (validated.value === 0) {
      // Remove vote
      await prisma.forumVote.deleteMany({
        where: {
          userId: session.user.id,
          topicId,
        },
      });

      return NextResponse.json({ voted: false, value: 0 });
    }

    // Upsert vote
    const vote = await prisma.forumVote.upsert({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId,
        },
      },
      update: {
        value: validated.value,
      },
      create: {
        userId: session.user.id,
        topicId,
        value: validated.value,
      },
    });

    return NextResponse.json({ voted: true, value: vote.value });
  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/forums/[topicId]/vote - Get current user's vote
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ voted: false, value: 0 });
    }

    const { topicId } = await params;

    const vote = await prisma.forumVote.findUnique({
      where: {
        userId_topicId: {
          userId: session.user.id,
          topicId,
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
