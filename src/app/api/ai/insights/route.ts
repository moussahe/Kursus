import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { z } from "zod";

const requestSchema = z.object({
  childId: z.string().cuid(),
});

interface ChildData {
  firstName: string;
  gradeLevel: string;
  progress: Array<{
    isCompleted: boolean;
    quizScore: number | null;
    timeSpent: number;
    lastAccessedAt: Date;
    lesson: {
      title: string;
      chapter: {
        course: {
          title: string;
          subject: string;
        };
      };
    };
  }>;
  purchases: Array<{
    course: {
      id: string;
      title: string;
      subject: string;
      totalLessons: number;
    };
  }>;
}

function formatGradeLevel(level: string): string {
  const levels: Record<string, string> = {
    CP: "CP",
    CE1: "CE1",
    CE2: "CE2",
    CM1: "CM1",
    CM2: "CM2",
    SIXIEME: "6eme",
    CINQUIEME: "5eme",
    QUATRIEME: "4eme",
    TROISIEME: "3eme",
    SECONDE: "Seconde",
    PREMIERE: "Premiere",
    TERMINALE: "Terminale",
  };
  return levels[level] || level;
}

function generateChildSummary(child: ChildData): string {
  const recentProgress = child.progress.slice(0, 20);
  const completedLessons = recentProgress.filter((p) => p.isCompleted);
  const averageQuizScore =
    recentProgress.filter((p) => p.quizScore !== null).length > 0
      ? Math.round(
          recentProgress
            .filter((p) => p.quizScore !== null)
            .reduce((sum, p) => sum + (p.quizScore || 0), 0) /
            recentProgress.filter((p) => p.quizScore !== null).length,
        )
      : null;

  // Calculate days since last activity
  const lastActivity = recentProgress[0]?.lastAccessedAt;
  const daysSinceActivity = lastActivity
    ? Math.floor(
        (Date.now() - new Date(lastActivity).getTime()) / (24 * 60 * 60 * 1000),
      )
    : null;

  // Group progress by subject
  const progressBySubject = new Map<
    string,
    { completed: number; total: number }
  >();
  for (const purchase of child.purchases) {
    const subject = purchase.course.subject;
    const courseCompleted = child.progress.filter(
      (p) =>
        p.isCompleted &&
        p.lesson.chapter.course.title === purchase.course.title,
    ).length;
    const existing = progressBySubject.get(subject) || {
      completed: 0,
      total: 0,
    };
    progressBySubject.set(subject, {
      completed: existing.completed + courseCompleted,
      total: existing.total + purchase.course.totalLessons,
    });
  }

  const subjectProgress = Array.from(progressBySubject.entries())
    .map(([subject, data]) => {
      const percent =
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
      return `- ${subject}: ${percent}% complete (${data.completed}/${data.total} leçons)`;
    })
    .join("\n");

  return `
PROFIL ELEVE:
- Prenom: ${child.firstName}
- Niveau: ${formatGradeLevel(child.gradeLevel)}
- Cours achetes: ${child.purchases.length}

ACTIVITE RECENTE:
- Derniere activite: ${daysSinceActivity !== null ? `il y a ${daysSinceActivity} jours` : "jamais"}
- Lecons completees (20 dernieres): ${completedLessons.length}
- Score moyen aux quiz: ${averageQuizScore !== null ? `${averageQuizScore}%` : "pas de quiz"}

PROGRESSION PAR MATIERE:
${subjectProgress || "- Aucun cours en cours"}

LECONS RECENTES:
${recentProgress
  .slice(0, 5)
  .map(
    (p) =>
      `- ${p.lesson.chapter.course.title} > ${p.lesson.title}: ${p.isCompleted ? "complete" : "en cours"}${p.quizScore !== null ? ` (quiz: ${p.quizScore}%)` : ""}`,
  )
  .join("\n")}
`;
}

const INSIGHTS_PROMPT = `Tu es un conseiller pedagogique expert pour Kursus, une plateforme educative francaise.
Tu analyses les donnees d'apprentissage d'un eleve pour generer des insights personnalises pour ses parents.

## Ta mission
Genere exactement 3 insights utiles et actionnables pour le parent base sur les donnees de l'eleve.

## Format de sortie OBLIGATOIRE (JSON)
{
  "insights": [
    {
      "type": "strength" | "concern" | "suggestion" | "milestone",
      "title": "Titre court (max 60 caracteres)",
      "message": "Message detaille pour le parent (2-3 phrases max)",
      "priority": "high" | "medium" | "low"
    }
  ]
}

## Types d'insights
- "strength": Point fort observe (encourager le parent)
- "concern": Point d'attention necessitant une action (inactivite, scores bas)
- "suggestion": Conseil pedagogique actionnable
- "milestone": Progression ou accomplissement notable

## Regles
- Ecris en francais
- Sois bienveillant mais honnete
- Pas de jargon technique
- Chaque insight doit etre actionnable
- Adapte le ton au niveau scolaire (primaire vs lycee)
- Inclus au moins un point positif si possible
- Si l'eleve n'a pas d'activite, sugger de commencer

DONNEES DE L'ELEVE:
`;

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
    }

    // 2. Rate limiting (5 insights generations per hour)
    const rateLimit = await checkRateLimit(session.user.id, "AI_INSIGHTS");
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Limite atteinte. Vous pouvez generer 5 analyses par heure.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: rateLimitHeaders(rateLimit),
        },
      );
    }

    // 3. Validation
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Requete invalide", details: parsed.error.issues },
        { status: 400 },
      );
    }

    const { childId } = parsed.data;

    // 4. Verify child belongs to parent
    const child = await prisma.child.findFirst({
      where: {
        id: childId,
        parentId: session.user.id,
      },
      include: {
        progress: {
          orderBy: { lastAccessedAt: "desc" },
          take: 20,
          include: {
            lesson: {
              include: {
                chapter: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
        purchases: {
          where: { status: "COMPLETED" },
          include: {
            course: true,
          },
        },
      },
    });

    if (!child) {
      return NextResponse.json({ error: "Enfant non trouve" }, { status: 404 });
    }

    // 5. Generate summary for AI
    const summary = generateChildSummary(child);

    // 6. Call Claude
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: INSIGHTS_PROMPT,
      messages: [
        {
          role: "user",
          content: summary,
        },
      ],
    });

    // 7. Parse response
    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const insights = JSON.parse(jsonMatch[0]);

    // 8. Return insights
    return NextResponse.json({
      childId,
      childName: child.firstName,
      insights: insights.insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[AI Insights Error]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Erreur de generation. Reessayez." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 },
    );
  }
}
