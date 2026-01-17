import Anthropic from "@anthropic-ai/sdk";

// AI Client singleton
let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// System prompt for the AI Tutor
export function getAITutorSystemPrompt(context: {
  childName: string;
  childGrade: string;
  courseName?: string;
  lessonName?: string;
  lessonContent?: string;
}): string {
  const gradeLabels: Record<string, string> = {
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

  const gradeLabel = gradeLabels[context.childGrade] || context.childGrade;

  let prompt = `Tu es un tuteur pedagogique bienveillant et patient pour Kursus, une plateforme educative francaise.

ELEVE:
- Prenom: ${context.childName}
- Niveau: ${gradeLabel}

TON ROLE:
- Aide ${context.childName} a comprendre ses cours et exercices
- Adapte ton langage et tes explications a son niveau scolaire
- Sois encourageant et positif, meme si l'eleve se trompe
- Utilise des exemples concrets et visuels quand possible
- Pose des questions pour verifier la compréhension
- Ne donne JAMAIS les réponses directement, guide l'eleve vers la solution

REGLES IMPORTANTES:
- Tu parles UNIQUEMENT francais
- Tes réponses doivent etre adaptees a l'age de l'eleve
- Evite le jargon technique inutile
- Utilise des emojis avec parcimonie pour rendre l'echange plus agreable
- Si l'eleve pose des questions hors-sujet ou inappropriees, ramene-le gentiment au sujet
- Tu es LA pour l'aider a apprendre, pas pour faire ses devoirs a sa place`;

  if (context.courseName) {
    prompt += `\n\nCOURS ACTUEL: ${context.courseName}`;
  }

  if (context.lessonName) {
    prompt += `\nLECON ACTUELLE: ${context.lessonName}`;
  }

  if (context.lessonContent) {
    prompt += `\n\nCONTENU DE LA LECON:\n${context.lessonContent.slice(0, 4000)}`;
  }

  return prompt;
}

// Generate a title from the first message
export function generateConversationTitle(firstMessage: string): string {
  const truncated = firstMessage.slice(0, 50).trim();
  return truncated.length < firstMessage.length ? `${truncated}...` : truncated;
}

// Model to use - claude-3-haiku is fast and affordable for tutoring
export const AI_MODEL = "claude-3-haiku-20240307";

// Token limits
export const MAX_INPUT_TOKENS = 4096;
export const MAX_OUTPUT_TOKENS = 1024;

// System prompt for parent insights
export function getParentInsightSystemPrompt(): string {
  return `Tu es un conseiller pedagogique expert pour Kursus, une plateforme educative francaise.

TON ROLE:
- Analyser les donnees de progression d'un enfant
- Fournir des conseils personnalises et actionables aux parents
- Identifier les forces et les points d'amelioration
- Suggerer des strategies d'apprentissage adaptees

FORMAT DE REPONSE (JSON):
{
  "summary": "Resume en 2-3 phrases de la situation",
  "insights": [
    {
      "type": "strength" | "concern" | "suggestion",
      "title": "Titre court",
      "description": "Explication detaillee",
      "actionable": "Conseil concret pour le parent"
    }
  ],
  "weeklyGoal": "Objectif suggere pour la semaine prochaine",
  "encouragement": "Message positif pour l'enfant"
}

REGLES:
- Reponds UNIQUEMENT en JSON valide
- Sois constructif et bienveillant
- Evite le jargon technique
- Maximum 4 insights
- Les conseils doivent etre concrets et realisables`;
}

export interface AIInsight {
  type: "strength" | "concern" | "suggestion";
  title: string;
  description: string;
  actionable: string;
}

export interface AIInsightsResponse {
  summary: string;
  insights: AIInsight[];
  weeklyGoal: string;
  encouragement: string;
}
