import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnthropicClient, AI_MODEL, MAX_OUTPUT_TOKENS } from "@/lib/ai";

interface RouteParams {
  params: Promise<{ courseId: string }>;
}

// System prompt for the teacher AI assistant
function getTeacherAssistantSystemPrompt(courseData: {
  title: string;
  subject: string;
  gradeLevel: string;
  description: string | null;
  learningOutcomes: string[];
  chapters: Array<{
    title: string;
    lessons: Array<{ title: string; content: string | null }>;
  }>;
  studentCount: number;
  avgProgress: number;
  avgQuizScore: number | null;
}): string {
  const gradeLevelLabels: Record<string, string> = {
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

  const subjectLabels: Record<string, string> = {
    MATHEMATIQUES: "Mathematiques",
    FRANCAIS: "Francais",
    HISTOIRE_GEO: "Histoire-Geographie",
    SCIENCES: "Sciences",
    ANGLAIS: "Anglais",
    PHYSIQUE_CHIMIE: "Physique-Chimie",
    SVT: "SVT",
    PHILOSOPHIE: "Philosophie",
    ESPAGNOL: "Espagnol",
    ALLEMAND: "Allemand",
    SES: "Sciences Economiques et Sociales",
    NSI: "Numerique et Sciences Informatiques",
  };

  const chaptersInfo = courseData.chapters
    .map((ch, i) => {
      const lessonsInfo = ch.lessons
        .map(
          (l, j) =>
            `    ${j + 1}. ${l.title}${l.content ? ` (contenu: ${l.content.slice(0, 200)}...)` : " (contenu vide)"}`,
        )
        .join("\n");
      return `  Chapitre ${i + 1}: ${ch.title}\n${lessonsInfo}`;
    })
    .join("\n\n");

  return `Tu es un assistant pedagogique expert pour les enseignants sur Schoolaris, la plateforme EdTech #1 en France.

INFORMATIONS SUR LE COURS:
- Titre: ${courseData.title}
- Matiere: ${subjectLabels[courseData.subject] || courseData.subject}
- Niveau: ${gradeLevelLabels[courseData.gradeLevel] || courseData.gradeLevel}
- Description: ${courseData.description || "Non definie"}
- Objectifs d'apprentissage: ${courseData.learningOutcomes.length > 0 ? courseData.learningOutcomes.join(", ") : "Non definis"}

STRUCTURE DU COURS:
${chaptersInfo || "Aucun chapitre cree"}

STATISTIQUES:
- Etudiants inscrits: ${courseData.studentCount}
- Progression moyenne: ${courseData.avgProgress}%
- Score quiz moyen: ${courseData.avgQuizScore !== null ? `${courseData.avgQuizScore}%` : "Pas encore de donnees"}

TON ROLE:
Tu es un conseiller pedagogique experimente qui aide les professeurs a:
1. Ameliorer le contenu de leurs cours
2. Creer des leçons engageantes et structurees
3. Generer des idees de quiz et exercices
4. Optimiser la progression pedagogique
5. Adapter le contenu au niveau des élèves
6. Augmenter l'engagement des étudiants

CAPACITES SPECIALES:
- Tu peux generer du contenu de lecon complet en markdown
- Tu peux suggerer des questions de quiz avec les bonnes réponses
- Tu peux proposer des exercices pratiques adaptes au niveau
- Tu peux analyser les statistiques et suggerer des ameliorations

REGLES:
- Reponds TOUJOURS en francais
- Sois professionnel mais accessible
- Donne des conseils concrets et actionnables
- Utilise le markdown pour formater tes réponses (listes, titres, gras)
- Quand tu generes du contenu de lecon, utilise une structure claire avec des titres
- Quand tu generes des quiz, utilise ce format:
  **Question X:** [La question]
  - A) [Option A]
  - B) [Option B]
  - C) [Option C]
  - D) [Option D]
  **Reponse:** [Lettre] - [Explication]

- Pour les exercices, propose des instructions claires et les solutions attendues
- Adapte TOUJOURS ton contenu au niveau scolaire indique

DEBUT DE CONVERSATION:
Presente-toi brievement et propose tes services au professeur.`;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorise" }, { status: 401 });
    }

    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const { courseId } = await params;
    const { message, conversationHistory } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // Verify course ownership and get course data
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: { position: "asc" },
          include: {
            lessons: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                content: true,
              },
            },
          },
        },
        _count: {
          select: {
            purchases: { where: { status: "COMPLETED" } },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Cours non trouve" }, { status: 404 });
    }

    if (course.authorId !== session.user.id) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    // Get course statistics
    const childIds = await prisma.purchase
      .findMany({
        where: { courseId, status: "COMPLETED" },
        select: { childId: true },
      })
      .then(
        (purchases) =>
          purchases.map((p) => p.childId).filter(Boolean) as string[],
      );

    const lessonIds = course.chapters.flatMap((c) =>
      c.lessons.map((l) => l.id),
    );

    let avgProgress = 0;
    let avgQuizScore: number | null = null;

    if (childIds.length > 0 && lessonIds.length > 0) {
      const progressData = await prisma.progress.findMany({
        where: {
          childId: { in: childIds },
          lessonId: { in: lessonIds },
        },
        select: { isCompleted: true, quizScore: true },
      });

      const completedCount = progressData.filter((p) => p.isCompleted).length;
      avgProgress = Math.round(
        (completedCount / (childIds.length * lessonIds.length)) * 100,
      );

      const quizScores = progressData
        .filter((p) => p.quizScore !== null)
        .map((p) => p.quizScore as number);
      if (quizScores.length > 0) {
        avgQuizScore = Math.round(
          quizScores.reduce((a, b) => a + b, 0) / quizScores.length,
        );
      }
    }

    // Build course data for context
    const courseData = {
      title: course.title,
      subject: course.subject,
      gradeLevel: course.gradeLevel,
      description: course.description,
      learningOutcomes: (course.learningOutcomes as string[]) ?? [],
      chapters: course.chapters.map((ch) => ({
        title: ch.title,
        lessons: ch.lessons.map((l) => ({
          title: l.title,
          content: l.content,
        })),
      })),
      studentCount: course._count.purchases,
      avgProgress,
      avgQuizScore,
    };

    // Build messages array for Claude
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add conversation history if provided
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory.slice(-10)) {
        // Limit to last 10 messages
        if (msg.role === "user" || msg.role === "assistant") {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Add current message
    messages.push({
      role: "user",
      content: message,
    });

    // Generate AI response
    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS * 2, // Allow longer responses for content generation
      system: getTeacherAssistantSystemPrompt(courseData),
      messages,
    });

    // Extract text content
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Reponse vide de l'IA");
    }

    return NextResponse.json({
      message: textContent.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error) {
    console.error("Teacher AI Assistant Error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la generation de la réponse" },
      { status: 500 },
    );
  }
}
