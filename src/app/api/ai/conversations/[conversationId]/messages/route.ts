import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, getHomeworkHelperPrompt } from "@/lib/anthropic";
import { z } from "zod";

// Schema pour envoyer un message
const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Le message ne peut pas etre vide")
    .max(2000, "Le message ne peut pas depasser 2000 caracteres"),
  context: z.object({
    level: z.string(),
    subject: z.string(),
    courseTitle: z.string().optional(),
    lessonTitle: z.string().optional(),
    lessonContent: z.string().optional(),
  }),
});

// Rate limiting simple (a remplacer par Redis en prod)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

// POST - Envoyer un message et obtenir une reponse IA
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        {
          error: "Limite atteinte. Vous pouvez poser 20 questions par heure.",
          retryAfter: 3600,
        },
        { status: 429 },
      );
    }

    const { conversationId } = await params;
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { content, context } = parsed.data;

    // Verifier que la conversation appartient a l'utilisateur
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        child: {
          parentId: session.user.id,
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            role: true,
            content: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvee" },
        { status: 404 },
      );
    }

    // Fetch lesson content if lessonId is available (for contextual AI help)
    let lessonData: {
      content: string | null;
      title: string;
      chapter: {
        course: {
          title: string;
          subject: string;
          gradeLevel: string;
        };
      };
    } | null = null;

    if (conversation.lessonId) {
      lessonData = await prisma.lesson.findUnique({
        where: { id: conversation.lessonId },
        select: {
          content: true,
          title: true,
          chapter: {
            select: {
              course: {
                select: {
                  title: true,
                  subject: true,
                  gradeLevel: true,
                },
              },
            },
          },
        },
      });
    }

    // Sauvegarder le message utilisateur
    const userMessage = await prisma.aIMessage.create({
      data: {
        conversationId,
        role: "USER",
        content,
        contextCourseId: conversation.courseId,
        contextLessonId: conversation.lessonId,
      },
    });

    // Preparer les messages pour Claude (incluant l'historique)
    const messagesForClaude = [
      ...conversation.messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content },
    ];

    // Enrichir le contexte avec le contenu de la lecon si disponible
    const enrichedContext = { ...context };
    if (lessonData) {
      enrichedContext.lessonContent =
        context.lessonContent || lessonData.content || undefined;
      enrichedContext.lessonTitle = context.lessonTitle || lessonData.title;
      if (lessonData.chapter?.course) {
        enrichedContext.courseTitle =
          context.courseTitle || lessonData.chapter.course.title;
        enrichedContext.subject =
          context.subject || lessonData.chapter.course.subject;
        enrichedContext.level =
          context.level || lessonData.chapter.course.gradeLevel;
      }
    }

    // Generer le system prompt avec contenu de lecon injecte
    const systemPrompt = getHomeworkHelperPrompt(enrichedContext);

    // Appeler Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesForClaude,
    });

    const assistantContent =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Sauvegarder la reponse de l'assistant
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: assistantContent,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        contextCourseId: conversation.courseId,
        contextLessonId: conversation.lessonId,
      },
    });

    // Mettre a jour le titre si c'est le premier message
    if (conversation.messages.length === 0 && !conversation.title) {
      // Generer un titre a partir du premier message
      const title =
        content.length > 50 ? content.substring(0, 47) + "..." : content;
      await prisma.aIConversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }

    // Mettre a jour updatedAt
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      userMessage: {
        id: userMessage.id,
        role: "user",
        content: userMessage.content,
        createdAt: userMessage.createdAt,
      },
      assistantMessage: {
        id: assistantMessage.id,
        role: "assistant",
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt,
      },
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("[Message POST Error]", error);

    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          {
            error: "Service temporairement surcharge. Reessayez dans 1 minute.",
          },
          { status: 503 },
        );
      }
      if (error.message.includes("invalid_api_key")) {
        return NextResponse.json(
          { error: "Service indisponible. Contactez le support." },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 },
    );
  }
}

// GET - Recuperer les messages d'une conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const { conversationId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const cursor = searchParams.get("cursor");

    // Verifier l'acces
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        child: {
          parentId: session.user.id,
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation non trouvee" },
        { status: 404 },
      );
    }

    // Recuperer les messages
    const messages = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      select: {
        id: true,
        role: true,
        content: true,
        tokensUsed: true,
        createdAt: true,
      },
    });

    let nextCursor: string | undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role.toLowerCase(),
        content: m.content,
        tokensUsed: m.tokensUsed,
        createdAt: m.createdAt,
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("[Messages GET Error]", error);
    return NextResponse.json(
      { error: "Erreur lors de la recuperation des messages" },
      { status: 500 },
    );
  }
}
