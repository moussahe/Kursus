import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, getHomeworkHelperPrompt } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { z } from "zod";

// Schema de validation
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(2000),
    }),
  ),
  context: z.object({
    level: z.string(),
    subject: z.string(),
    courseTitle: z.string().optional(),
    lessonTitle: z.string().optional(),
    lessonContent: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié. Connectez-vous pour utiliser l'assistant." },
        { status: 401 },
      );
    }

    // 2. Rate limiting (Redis en prod, mémoire en dev)
    const rateLimit = await checkRateLimit(session.user.id, "AI_CHAT");
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Limite atteinte. Vous pouvez poser 20 questions par heure.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimit),
        },
      );
    }

    // 3. Validation du body
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requête invalide", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { messages, context } = parsed.data;

    // 4. Générer le system prompt avec contexte
    const systemPrompt = getHomeworkHelperPrompt(context);

    // 5. Appeler Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    // 6. Extraire la réponse
    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 7. Retourner la réponse
    return NextResponse.json({
      message: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("[AI Chat Error]", error);

    // Gestion des erreurs Anthropic
    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          {
            error: "Service temporairement surchargé. Réessayez dans 1 minute.",
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
      { error: "Une erreur est survenue. Réessayez." },
      { status: 500 },
    );
  }
}
