import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, getHomeworkHelperPrompt } from "@/lib/anthropic";
import { z } from "zod";
import { addXP, XP_REWARDS, updateStreak } from "@/lib/gamification";

// Schema pour envoyer un message avec streaming
const streamMessageSchema = z.object({
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

// Rate limiting simple (en memoire pour dev, Redis en prod)
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

// POST - Envoyer un message et recevoir une réponse en streaming
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Non autorise" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rate limiting
    if (!checkRateLimit(session.user.id)) {
      return new Response(
        JSON.stringify({
          error: "Limite atteinte. Vous pouvez poser 20 questions par heure.",
          retryAfter: 3600,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "3600",
          },
        },
      );
    }

    const { conversationId } = await params;
    const body = await req.json();
    const parsed = streamMessageSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Donnees invalides",
          details: parsed.error.issues,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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
        child: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation non trouvee" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    // Fetch lesson content if lessonId is available
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

    // Preparer les messages pour Claude
    const messagesForClaude = [
      ...conversation.messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content },
    ];

    // Enrichir le contexte avec le contenu de la lecon
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

    // Generer le system prompt
    const systemPrompt = getHomeworkHelperPrompt(enrichedContext);

    // Creer le stream avec Anthropic
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messagesForClaude,
    });

    // Creer un ReadableStream pour la réponse
    const encoder = new TextEncoder();
    let fullContent = "";
    let inputTokens = 0;
    let outputTokens = 0;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Envoyer l'ID du message utilisateur en premier
          const initEvent = {
            type: "init",
            userMessageId: userMessage.id,
            userMessageCreatedAt: userMessage.createdAt.toISOString(),
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(initEvent)}\n\n`),
          );

          // Streamer les chunks de texte
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullContent += text;

              const textEvent = {
                type: "text",
                text,
              };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(textEvent)}\n\n`),
              );
            }
          }

          // Recuperer l'usage final
          const finalMessage = await stream.finalMessage();
          inputTokens = finalMessage.usage.input_tokens;
          outputTokens = finalMessage.usage.output_tokens;

          // Sauvegarder la réponse complete en base
          const assistantMessage = await prisma.aIMessage.create({
            data: {
              conversationId,
              role: "ASSISTANT",
              content: fullContent,
              tokensUsed: inputTokens + outputTokens,
              contextCourseId: conversation.courseId,
              contextLessonId: conversation.lessonId,
            },
          });

          // Mettre a jour le titre si premier message
          if (conversation.messages.length === 0 && !conversation.title) {
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

          // Recompenser l'eleve avec des XP pour avoir pose une question
          let xpAwarded = 0;
          let leveledUp = false;
          if (conversation.child?.id) {
            try {
              const xpResult = await addXP(
                conversation.child.id,
                XP_REWARDS.AI_CHAT_QUESTION,
                "Question posee au tuteur IA",
              );
              xpAwarded = XP_REWARDS.AI_CHAT_QUESTION;
              leveledUp = xpResult.leveledUp;

              // Mettre a jour le streak d'activite
              await updateStreak(conversation.child.id);
            } catch {
              // Ignorer les erreurs de gamification pour ne pas bloquer le chat
            }
          }

          // Envoyer l'evenement de fin
          const doneEvent = {
            type: "done",
            assistantMessageId: assistantMessage.id,
            assistantMessageCreatedAt: assistantMessage.createdAt.toISOString(),
            usage: {
              inputTokens,
              outputTokens,
            },
            gamification: {
              xpAwarded,
              leveledUp,
            },
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`),
          );

          controller.close();
        } catch (error) {
          // En cas d'erreur pendant le streaming
          const errorEvent = {
            type: "error",
            error: error instanceof Error ? error.message : "Erreur inconnue",
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
          );
          controller.close();
        }
      },
    });

    // Retourner le stream SSE
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[Stream Message Error]", error);

    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        return new Response(
          JSON.stringify({
            error: "Service temporairement surcharge. Reessayez dans 1 minute.",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
      if (error.message.includes("invalid_api_key")) {
        return new Response(
          JSON.stringify({
            error: "Service indisponible. Contactez le support.",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Erreur lors de l'envoi du message" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
