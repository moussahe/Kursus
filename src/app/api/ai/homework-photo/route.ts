import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { z } from "zod";

// Schema de validation
const homeworkPhotoSchema = z.object({
  image: z.string().min(1, "Image requise"), // Base64 encoded image
  imageType: z.enum(["image/jpeg", "image/png", "image/gif", "image/webp"]),
  question: z.string().max(500).optional(), // Optional question about the image
  context: z.object({
    level: z.string(),
    subject: z.string(),
    courseTitle: z.string().optional(),
    lessonTitle: z.string().optional(),
  }),
  childId: z.string().optional(),
});

// System prompt specialise pour l'analyse de photos de devoirs
const HOMEWORK_PHOTO_PROMPT = `Tu es un assistant pedagogique bienveillant pour Kursus, une plateforme educative francaise.
Un eleve t'envoie une photo de son devoir ou exercice. Ta mission est de l'aider a comprendre sans lui donner directement les réponses.

## Regles ABSOLUES

1. **ANALYSE LA PHOTO ATTENTIVEMENT**
   - Identifie le type d'exercice (calcul, problème, texte, schema, etc.)
   - Repere ou l'eleve pourrait etre bloque
   - Note ce qui est deja fait et ce qui reste a faire

2. **NE JAMAIS DONNER LA REPONSE DIRECTEMENT**
   - Guide avec des questions: "Qu'est-ce que tu as deja essaye ?"
   - Decompose le problème en etapes simples
   - Donne des indices progressifs
   - Utilise la methode socratique

3. **ADAPTE TON LANGAGE AU NIVEAU**
   - {level}: Adapte ton vocabulaire et tes explications

4. **STRUCTURE TA REPONSE**
   - Commence par decrire ce que tu vois dans la photo
   - Identifie le sujet/concept travaille
   - Pose une question pour comprendre ou l'eleve bloque
   - Propose une premiere piste de reflexion

5. **SOIS ENCOURAGEANT**
   - "Bonne question !", "Je vois que tu as deja bien avance !"
   - Ne fais jamais sentir l'eleve stupide

## Contexte actuel
- Niveau scolaire: {level}
- Matiere: {subject}
- Cours: {courseTitle}
- Lecon en cours: {lessonTitle}

## Format
- Reponds en francais
- Maximum 200 mots pour la premiere réponse
- Termine par une question pour engager le dialogue`;

function getPhotoHelperPrompt(context: {
  level: string;
  subject: string;
  courseTitle?: string;
  lessonTitle?: string;
}): string {
  return HOMEWORK_PHOTO_PROMPT.replace(/{level}/g, context.level)
    .replace("{subject}", context.subject)
    .replace("{courseTitle}", context.courseTitle || "Non specifie")
    .replace("{lessonTitle}", context.lessonTitle || "Non specifie");
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authentification
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error:
            "Non authentifie. Connectez-vous pour utiliser l'assistant photo.",
        },
        { status: 401 },
      );
    }

    // 2. Rate limiting (plus strict pour les images - plus couteux)
    const rateLimit = await checkRateLimit(session.user.id, "AI_CHAT");
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error:
            "Limite atteinte. Vous pouvez envoyer 10 photos de devoirs par heure.",
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
    const parsed = homeworkPhotoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requete invalide", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { image, imageType, question, context } = parsed.data;

    // 4. Valider la taille de l'image (max 5MB en base64)
    const imageSizeBytes = (image.length * 3) / 4; // Approximation base64
    if (imageSizeBytes > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image trop volumineuse. Maximum 5 Mo autorise." },
        { status: 400 },
      );
    }

    // 5. Generer le system prompt avec contexte
    const systemPrompt = getPhotoHelperPrompt(context);

    // 6. Construire le message avec l'image
    const userContent: Anthropic.MessageCreateParams["messages"][0]["content"] =
      [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: imageType,
            data: image,
          },
        },
      ];

    // Ajouter la question de l'utilisateur si fournie
    if (question) {
      userContent.push({
        type: "text",
        text: question,
      });
    } else {
      userContent.push({
        type: "text",
        text: "Peux-tu m'aider avec ce devoir ?",
      });
    }

    // 7. Appeler Claude avec vision
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userContent,
        },
      ],
    });

    // 8. Extraire la réponse
    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // 9. Retourner la réponse
    return NextResponse.json({
      message: assistantMessage,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("[AI Homework Photo Error]", error);

    // Gestion des erreurs Anthropic
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
      if (
        error.message.includes("Could not process image") ||
        error.message.includes("invalid_image")
      ) {
        return NextResponse.json(
          {
            error:
              "Image non reconnue. Assurez-vous que la photo est nette et bien eclairee.",
          },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { error: "Une erreur est survenue. Reessayez." },
      { status: 500 },
    );
  }
}

// Type import for Anthropic
import type Anthropic from "@anthropic-ai/sdk";
