import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  handleApiError,
  unauthorized,
  forbidden,
  badRequest,
} from "@/lib/api-error";
import { createTopicSchema, topicsQuerySchema } from "@/lib/validations/forum";
import { Prisma } from "@prisma/client";

// GET /api/forums - List forum topics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = topicsQuerySchema.parse(Object.fromEntries(searchParams));
    const {
      category,
      subject,
      gradeLevel,
      authorId,
      search,
      isPinned,
      isResolved,
      sortBy,
      page,
      limit,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ForumTopicWhereInput = {};

    if (category) {
      where.category = category;
    }
    if (subject) {
      where.subject = subject;
    }
    if (gradeLevel) {
      where.gradeLevel = gradeLevel;
    }
    if (authorId) {
      where.authorId = authorId;
    }
    if (isPinned !== undefined) {
      where.isPinned = isPinned;
    }
    if (isResolved !== undefined) {
      where.isResolved = isResolved;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by
    type OrderBy =
      | { isPinned: "desc"; createdAt: "desc" }
      | { isPinned: "desc"; viewCount: "desc" }
      | { isPinned: "desc"; replyCount: "desc" };

    let orderBy: OrderBy;
    switch (sortBy) {
      case "popular":
        orderBy = { isPinned: "desc", viewCount: "desc" };
        break;
      case "most_replies":
        orderBy = { isPinned: "desc", replyCount: "desc" };
        break;
      default:
        orderBy = { isPinned: "desc", createdAt: "desc" };
    }

    const [topics, total] = await prisma.$transaction([
      prisma.forumTopic.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isPinned: "desc" }, orderBy],
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
          _count: {
            select: {
              replies: true,
              votes: true,
            },
          },
        },
      }),
      prisma.forumTopic.count({ where }),
    ]);

    return NextResponse.json({
      data: topics,
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

// POST /api/forums - Create a new topic
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return unauthorized();
    }

    const body = await req.json();
    const validated = createTopicSchema.parse(body);

    // Check category access
    if (
      validated.category === "TEACHER_LOUNGE" &&
      session.user.role !== "TEACHER" &&
      session.user.role !== "ADMIN"
    ) {
      return forbidden("Seuls les enseignants peuvent poster dans cet espace");
    }

    if (
      validated.category === "ANNOUNCEMENTS" &&
      session.user.role !== "ADMIN"
    ) {
      return forbidden("Seuls les administrateurs peuvent poster des annonces");
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

    // Create the topic
    const topic = await prisma.forumTopic.create({
      data: {
        title: validated.title,
        content: validated.content,
        category: validated.category,
        subject: validated.subject,
        gradeLevel: validated.gradeLevel,
        authorId: session.user.id,
        authorType: session.user.role,
        childId: validated.childId,
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

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
