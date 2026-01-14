// API endpoint for contextual AI help on quiz questions
// Schoolaris - Quiz-AI Integration

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getAnthropicClient } from "@/lib/ai";

const requestSchema = z.object({
  childId: z.string().cuid(),
  questionText: z.string().min(5),
  options: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean().optional(),
    }),
  ),
  subject: z.string(),
  gradeLevel: z.string(),
  lessonTitle: z.string(),
  lessonContent: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

const GRADE_LABELS: Record<string, string> = {
  CP: "CP (6 ans)",
  CE1: "CE1 (7 ans)",
  CE2: "CE2 (8 ans)",
  CM1: "CM1 (9 ans)",
  CM2: "CM2 (10 ans)",
  SIXIEME: "6eme (11 ans)",
  CINQUIEME: "5eme (12 ans)",
  QUATRIEME: "4eme (13 ans)",
  TROISIEME: "3eme (14 ans)",
  SECONDE: "Seconde (15 ans)",
  PREMIERE: "Premiere (16 ans)",
  TERMINALE: "Terminale (17 ans)",
};

function getQuizHelpPrompt(
  question: string,
  options: Array<{ text: string }>,
  subject: string,
  gradeLevel: string,
  lessonTitle: string,
  lessonContent?: string,
  difficulty?: string,
): string {
  const gradeLabel = GRADE_LABELS[gradeLevel] || gradeLevel;
  const optionsList = options.map((o, i) => `${i + 1}. ${o.text}`).join("\n");

  return `Tu es un tuteur pedagogique bienveillant pour Schoolaris. Un eleve te demande de l'aide sur une question de quiz.

CONTEXTE:
- Niveau scolaire: ${gradeLabel}
- Matiere: ${subject}
- Lecon: ${lessonTitle}
${difficulty ? `- Difficulte: ${difficulty}` : ""}

QUESTION DU QUIZ:
"${question}"

OPTIONS:
${optionsList}

${lessonContent ? `EXTRAIT DE LA LECON:\n${lessonContent.slice(0, 1500)}\n` : ""}

MISSION:
Guide l'eleve vers la bonne reponse SANS lui donner directement la solution. Utilise la methode socratique.

REGLES:
1. NE JAMAIS reveler la bonne reponse
2. Poser des questions guidees pour faire reflechir
3. Donner des indices progressifs
4. Rappeler les concepts cles de la lecon si necessaire
5. Encourager l'eleve
6. Adapter le langage au niveau scolaire (${gradeLabel})
7. Etre concis (max 150 mots)

FORMAT:
Reponds directement en francais, de facon naturelle et encourageante.`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    const body = await req.json();
    const validated = requestSchema.parse(body);

    // Verify parent owns this child or is the child's account
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        parentId: session.user.id,
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // Get AI client and generate help
    const client = getAnthropicClient();

    const prompt = getQuizHelpPrompt(
      validated.questionText,
      validated.options,
      validated.subject,
      validated.gradeLevel,
      validated.lessonTitle,
      validated.lessonContent,
      validated.difficulty,
    );

    const response = await client.messages.create({
      model: "claude-3-5-haiku-latest",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Track that this child asked for help (for analytics)
    // This can be used to identify weak areas more accurately
    await prisma.quizHelpRequest.create({
      data: {
        childId: validated.childId,
        questionText: validated.questionText,
        subject: validated.subject,
        lessonTitle: validated.lessonTitle,
      },
    });

    return NextResponse.json({
      help: textContent.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation echouee", details: error.issues },
        { status: 400 },
      );
    }

    console.error("Quiz help API error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
