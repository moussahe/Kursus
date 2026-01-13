import { anthropic, SYSTEM_PROMPTS } from "./anthropic";

interface WeeklyReportData {
  childName: string;
  gradeLevel: string;
  lessonsCompleted: number;
  quizzesCompleted: number;
  avgQuizScore: number | null;
  totalTime: number;
  xpEarned: number;
  streakDays: number;
  lessonsDelta: number | null;
  timeDelta: number | null;
  subjects: string[];
  courses: string[];
}

export interface WeeklyReportRecommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface GeneratedWeeklyReport {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: WeeklyReportRecommendation[];
  encouragement: string;
  parentTips: string;
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

function formatSubject(subject: string): string {
  const subjects: Record<string, string> = {
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
    SES: "SES",
    NSI: "NSI",
  };
  return subjects[subject] || subject;
}

export async function generateWeeklyReport(
  data: WeeklyReportData,
): Promise<GeneratedWeeklyReport> {
  const prompt = SYSTEM_PROMPTS.WEEKLY_REPORT.replace(
    "{childName}",
    data.childName,
  )
    .replace("{gradeLevel}", formatGradeLevel(data.gradeLevel))
    .replace("{lessonsCompleted}", data.lessonsCompleted.toString())
    .replace("{quizzesCompleted}", data.quizzesCompleted.toString())
    .replace(
      "{avgQuizScore}",
      data.avgQuizScore !== null ? data.avgQuizScore.toFixed(0) : "N/A",
    )
    .replace("{totalTime}", data.totalTime.toString())
    .replace("{xpEarned}", data.xpEarned.toString())
    .replace("{streakDays}", data.streakDays.toString())
    .replace(
      "{lessonsDelta}",
      data.lessonsDelta !== null
        ? (data.lessonsDelta > 0 ? "+" : "") + data.lessonsDelta.toString()
        : "N/A",
    )
    .replace(
      "{timeDelta}",
      data.timeDelta !== null
        ? (data.timeDelta > 0 ? "+" : "") + data.timeDelta.toString()
        : "N/A",
    )
    .replace(
      "{subjects}",
      data.subjects.map(formatSubject).join(", ") || "Aucune",
    )
    .replace("{courses}", data.courses.join(", ") || "Aucun");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Genere le rapport hebdomadaire pour cet enfant basé sur les données fournies. Reponds UNIQUEMENT avec le JSON demande, sans texte avant ou apres.`,
      },
    ],
    system: prompt,
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from AI");
  }

  try {
    // Parse the JSON response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    const parsed = JSON.parse(jsonMatch[0]) as GeneratedWeeklyReport;

    // Validate required fields
    if (!parsed.summary || !Array.isArray(parsed.strengths)) {
      throw new Error("Invalid report structure");
    }

    return parsed;
  } catch {
    // Fallback if AI response is malformed
    return {
      summary: `${data.childName} a complete ${data.lessonsCompleted} lecon(s) cette semaine et passe ${data.totalTime} minutes a etudier.`,
      strengths:
        data.lessonsCompleted > 0
          ? ["Continue a progresser regulierement"]
          : [],
      areasToImprove:
        data.lessonsCompleted === 0
          ? ["Reprendre une routine d'etude quotidienne"]
          : [],
      recommendations: [
        {
          title: "Maintenir le rythme",
          description:
            "Continuer a etudier regulierement pour consolider les acquis.",
          priority: "medium",
        },
      ],
      encouragement: `Continue comme ca ${data.childName} ! Chaque effort compte.`,
      parentTips:
        "N'hesitez pas a discuter avec votre enfant de ce qu'il a appris cette semaine.",
    };
  }
}

export function getWeekBounds(date: Date = new Date()): {
  weekStart: Date;
  weekEnd: Date;
} {
  const d = new Date(date);
  const day = d.getDay();
  // Get Monday (day 1) - if Sunday (0), go back 6 days
  const diff = day === 0 ? 6 : day - 1;

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - diff);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
}

export function getPreviousWeekBounds(date: Date = new Date()): {
  weekStart: Date;
  weekEnd: Date;
} {
  const prevWeek = new Date(date);
  prevWeek.setDate(prevWeek.getDate() - 7);
  return getWeekBounds(prevWeek);
}

export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  const startStr = weekStart.toLocaleDateString("fr-FR", options);
  const endStr = weekEnd.toLocaleDateString("fr-FR", options);
  return `${startStr} - ${endStr}`;
}
