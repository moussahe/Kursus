// AI Quiz Generation and Feedback
// Schoolaris - Quiz adaptatif avec Claude AI

import { z } from "zod";
import { getAnthropicClient } from "./ai";

// Model for quiz generation - using latest haiku for better quality
export const QUIZ_AI_MODEL = "claude-3-5-haiku-latest";

// Zod schemas for AI response validation
const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const generatedQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(optionSchema).length(4),
  explanation: z.string().min(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().min(1).max(3),
});

const questionsResponseSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1),
});

const quizFeedbackSchema = z.object({
  summary: z.string().min(10),
  encouragement: z.string().min(10),
  areasToReview: z.array(z.string()),
  nextSteps: z.string().min(10),
  difficultyRecommendation: z.enum(["easy", "medium", "hard"]),
});

const weakAreasResponseSchema = z.object({
  weakAreas: z.array(
    z.object({
      topic: z.string().min(2),
      category: z.enum([
        "calcul",
        "comprehension",
        "methode",
        "memorisation",
        "application",
        "analyse",
      ]),
    }),
  ),
});

export type Difficulty = "easy" | "medium" | "hard";

export interface GeneratedQuestion {
  question: string;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  explanation: string;
  difficulty: Difficulty;
  points: number;
}

export interface QuizGenerationContext {
  subject: string;
  gradeLevel: string;
  lessonTitle: string;
  lessonContent: string;
  currentDifficulty: Difficulty;
  previousPerformance?: {
    correctRate: number;
    weakAreas: string[];
  };
}

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

const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: "Questions simples, definitions de base, concepts fondamentaux. L'eleve doit pouvoir y repondre avec une comprehension minimale.",
  medium:
    "Questions de niveau intermediaire, application des concepts, quelques liens entre notions. Demande une bonne comprehension.",
  hard: "Questions avancees, analyse, synthese, cas complexes. Demande une maitrise approfondie du sujet.",
};

export function getQuizGenerationPrompt(
  context: QuizGenerationContext,
): string {
  const gradeLabel = GRADE_LABELS[context.gradeLevel] || context.gradeLevel;
  const difficultyDesc = DIFFICULTY_DESCRIPTIONS[context.currentDifficulty];

  let performanceContext = "";
  if (context.previousPerformance) {
    performanceContext = `
PERFORMANCE PRECEDENTE:
- Taux de reussite: ${Math.round(context.previousPerformance.correctRate * 100)}%
- Points faibles identifies: ${context.previousPerformance.weakAreas.join(", ") || "Aucun"}

Adapte les questions en fonction de cette performance. Si l'eleve a des points faibles, inclus des questions qui ciblent ces domaines.`;
  }

  return `Tu es un expert en pedagogie et creation de quiz educatifs pour Schoolaris.

CONTEXTE:
- Matiere: ${context.subject}
- Niveau scolaire: ${gradeLabel}
- Lecon: ${context.lessonTitle}
- Difficulte demandee: ${context.currentDifficulty.toUpperCase()}
${performanceContext}

CONTENU DE LA LECON:
${context.lessonContent.slice(0, 3000)}

NIVEAU DE DIFFICULTE "${context.currentDifficulty.toUpperCase()}":
${difficultyDesc}

TACHE:
Genere 3 questions de quiz basees sur le contenu de la lecon, au niveau de difficulte demande.

REGLES:
1. Chaque question doit avoir exactement 4 options (A, B, C, D)
2. Une seule reponse correcte par question
3. Les options incorrectes doivent etre plausibles (pas de reponses absurdes)
4. L'explication doit etre pedagogique et adaptee au niveau de l'eleve
5. Les points varient: easy=1pt, medium=2pts, hard=3pts
6. Les questions doivent tester la comprehension, pas juste la memorisation

FORMAT DE REPONSE (JSON strict):
{
  "questions": [
    {
      "question": "La question posee?",
      "options": [
        { "id": "a", "text": "Option A", "isCorrect": false },
        { "id": "b", "text": "Option B", "isCorrect": true },
        { "id": "c", "text": "Option C", "isCorrect": false },
        { "id": "d", "text": "Option D", "isCorrect": false }
      ],
      "explanation": "Explication pedagogique de la bonne reponse",
      "difficulty": "${context.currentDifficulty}",
      "points": ${context.currentDifficulty === "easy" ? 1 : context.currentDifficulty === "medium" ? 2 : 3}
    }
  ]
}

Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres.`;
}

export async function generateAdaptiveQuestions(
  context: QuizGenerationContext,
): Promise<GeneratedQuestion[]> {
  const client = getAnthropicClient();
  const prompt = getQuizGenerationPrompt(context);

  try {
    const response = await client.messages.create({
      model: QUIZ_AI_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    // Parse and validate with Zod schema
    const rawParsed = JSON.parse(jsonMatch[0]);
    const validationResult = questionsResponseSchema.safeParse(rawParsed);

    if (!validationResult.success) {
      // Log validation errors for debugging but don't expose to user
      console.error(
        "AI response validation failed:",
        validationResult.error.issues,
      );
      return getFallbackQuestions(context.currentDifficulty);
    }

    // Additional validation: ensure exactly one correct answer per question
    for (const question of validationResult.data.questions) {
      const correctCount = question.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        console.error(
          `Invalid question: ${correctCount} correct answers found`,
        );
        return getFallbackQuestions(context.currentDifficulty);
      }
    }

    return validationResult.data.questions;
  } catch (error) {
    console.error("Error generating adaptive questions:", error);
    // Return fallback questions in case of error
    return getFallbackQuestions(context.currentDifficulty);
  }
}

function getFallbackQuestions(difficulty: Difficulty): GeneratedQuestion[] {
  const points = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return [
    {
      question: "Quelle est la notion principale abordee dans cette lecon?",
      options: [
        { id: "a", text: "Concept A", isCorrect: false },
        { id: "b", text: "Le concept principal", isCorrect: true },
        { id: "c", text: "Concept C", isCorrect: false },
        { id: "d", text: "Concept D", isCorrect: false },
      ],
      explanation:
        "Cette question teste ta comprehension generale de la lecon.",
      difficulty,
      points,
    },
  ];
}

// Quiz Feedback Generation
export interface QuizFeedbackContext {
  childName: string;
  gradeLevel: string;
  subject: string;
  lessonTitle: string;
  score: number;
  totalPoints: number;
  correctCount: number;
  totalQuestions: number;
  wrongAnswers: Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
  }>;
}

export interface QuizFeedback {
  summary: string;
  encouragement: string;
  areasToReview: string[];
  nextSteps: string;
  difficultyRecommendation: Difficulty;
}

export function getQuizFeedbackPrompt(context: QuizFeedbackContext): string {
  const percentage = Math.round((context.score / context.totalPoints) * 100);
  const gradeLabel = GRADE_LABELS[context.gradeLevel] || context.gradeLevel;

  const wrongAnswersList =
    context.wrongAnswers.length > 0
      ? context.wrongAnswers
          .map(
            (w, i) =>
              `${i + 1}. Question: "${w.question}"
      - Reponse de l'eleve: "${w.selectedAnswer}"
      - Bonne reponse: "${w.correctAnswer}"`,
          )
          .join("\n")
      : "Aucune erreur!";

  return `Tu es un tuteur bienveillant pour Schoolaris qui donne du feedback sur les quiz.

RESULTATS DU QUIZ:
- Eleve: ${context.childName}
- Niveau: ${gradeLabel}
- Matiere: ${context.subject}
- Lecon: ${context.lessonTitle}
- Score: ${context.score}/${context.totalPoints} points (${percentage}%)
- Questions correctes: ${context.correctCount}/${context.totalQuestions}

ERREURS:
${wrongAnswersList}

TACHE:
Genere un feedback personnalise et encourageant pour cet eleve.

FORMAT DE REPONSE (JSON strict):
{
  "summary": "Resume du resultat en 1-2 phrases, adapte a l'age",
  "encouragement": "Message d'encouragement personnalise",
  "areasToReview": ["Point 1 a revoir", "Point 2 a revoir"],
  "nextSteps": "Conseil concret pour progresser",
  "difficultyRecommendation": "easy" | "medium" | "hard"
}

REGLES pour difficultyRecommendation:
- Si score < 50%: "easy" (besoin de consolider les bases)
- Si score 50-80%: "medium" (bon niveau, peut progresser)
- Si score > 80%: "hard" (pret pour des defis)

Reponds UNIQUEMENT avec le JSON.`;
}

function getFallbackFeedback(context: QuizFeedbackContext): QuizFeedback {
  const percentage = Math.round((context.score / context.totalPoints) * 100);
  return {
    summary:
      percentage >= 70
        ? `Bravo ${context.childName}! Tu as bien compris cette lecon.`
        : `Continue tes efforts ${context.childName}! Tu progresses.`,
    encouragement:
      percentage >= 70
        ? "Tu es sur la bonne voie! Continue comme ca!"
        : "Chaque erreur est une occasion d'apprendre. Tu vas y arriver!",
    areasToReview:
      context.wrongAnswers.length > 0
        ? ["Relis les parties de la lecon correspondant aux questions manquees"]
        : [],
    nextSteps:
      percentage >= 70
        ? "Tu peux passer a la lecon suivante ou refaire le quiz pour viser 100%!"
        : "Relis la lecon et refais le quiz pour ameliorer ton score.",
    difficultyRecommendation:
      percentage < 50 ? "easy" : percentage > 80 ? "hard" : "medium",
  };
}

export async function generateQuizFeedback(
  context: QuizFeedbackContext,
): Promise<QuizFeedback> {
  const client = getAnthropicClient();
  const prompt = getQuizFeedbackPrompt(context);

  try {
    const response = await client.messages.create({
      model: QUIZ_AI_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    // Parse and validate with Zod schema
    const rawParsed = JSON.parse(jsonMatch[0]);
    const validationResult = quizFeedbackSchema.safeParse(rawParsed);

    if (!validationResult.success) {
      console.error(
        "Quiz feedback validation failed:",
        validationResult.error.issues,
      );
      return getFallbackFeedback(context);
    }

    return validationResult.data;
  } catch (error) {
    console.error("Error generating quiz feedback:", error);
    return getFallbackFeedback(context);
  }
}

// Weak Area Extraction from Quiz Errors
export interface WrongAnswer {
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
}

export interface ExtractedWeakArea {
  topic: string; // e.g., "fractions", "conjugaison imparfait"
  category: string; // e.g., "calcul", "comprehension", "methode"
}

export function getWeakAreaExtractionPrompt(
  wrongAnswers: WrongAnswer[],
  subject: string,
  lessonTitle: string,
): string {
  const errorsList = wrongAnswers
    .map(
      (w, i) =>
        `${i + 1}. Question: "${w.question}"
   - Reponse de l'eleve: "${w.selectedAnswer}"
   - Bonne reponse: "${w.correctAnswer}"`,
    )
    .join("\n");

  return `Tu es un expert en pedagogie pour Schoolaris. Analyse les erreurs suivantes et identifie les points faibles specifiques.

CONTEXTE:
- Matiere: ${subject}
- Lecon: ${lessonTitle}

ERREURS DE L'ELEVE:
${errorsList}

TACHE:
Pour chaque erreur, identifie le TOPIC precis (concept/notion) que l'eleve n'a pas maitrise.

REGLES:
1. Le topic doit etre un concept SPECIFIQUE (pas "mathematiques" mais "fractions", "theoreme de Pythagore", etc.)
2. La categorie doit etre: "calcul", "comprehension", "methode", "memorisation", "application", ou "analyse"
3. Si plusieurs erreurs concernent le meme topic, ne le liste qu'une fois

FORMAT DE REPONSE (JSON strict):
{
  "weakAreas": [
    {
      "topic": "nom specifique du concept non maitrise",
      "category": "type d'erreur"
    }
  ]
}

Reponds UNIQUEMENT avec le JSON.`;
}

function getFallbackWeakAreas(
  wrongAnswers: WrongAnswer[],
  lessonTitle: string,
): ExtractedWeakArea[] {
  // Deduplicate to avoid repetitive fallback entries
  return [
    {
      topic: lessonTitle,
      category: "comprehension" as const,
    },
  ].slice(0, Math.min(wrongAnswers.length, 3));
}

export async function extractWeakAreas(
  wrongAnswers: WrongAnswer[],
  subject: string,
  lessonTitle: string,
): Promise<ExtractedWeakArea[]> {
  if (wrongAnswers.length === 0) {
    return [];
  }

  const client = getAnthropicClient();
  const prompt = getWeakAreaExtractionPrompt(
    wrongAnswers,
    subject,
    lessonTitle,
  );

  try {
    const response = await client.messages.create({
      model: QUIZ_AI_MODEL,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    // Parse and validate with Zod schema
    const rawParsed = JSON.parse(jsonMatch[0]);
    const validationResult = weakAreasResponseSchema.safeParse(rawParsed);

    if (!validationResult.success) {
      console.error(
        "Weak areas validation failed:",
        validationResult.error.issues,
      );
      return getFallbackWeakAreas(wrongAnswers, lessonTitle);
    }

    return validationResult.data.weakAreas;
  } catch (error) {
    console.error("Error extracting weak areas:", error);
    return getFallbackWeakAreas(wrongAnswers, lessonTitle);
  }
}

// Calculate next difficulty based on performance
export function calculateNextDifficulty(
  currentDifficulty: Difficulty,
  correctRate: number,
  consecutiveCorrect: number,
  consecutiveWrong: number,
): Difficulty {
  // Strong performance - move up
  if (correctRate >= 0.8 && consecutiveCorrect >= 2) {
    if (currentDifficulty === "easy") return "medium";
    if (currentDifficulty === "medium") return "hard";
  }

  // Struggling - move down
  if (correctRate < 0.5 || consecutiveWrong >= 2) {
    if (currentDifficulty === "hard") return "medium";
    if (currentDifficulty === "medium") return "easy";
  }

  return currentDifficulty;
}

// ============================================
// REAL-TIME SINGLE QUESTION GENERATION
// ============================================

export interface SingleQuestionContext {
  subject: string;
  gradeLevel: string;
  lessonTitle: string;
  lessonContent: string;
  currentDifficulty: Difficulty;
  weakAreas: string[];
  previousQuestions: string[]; // To avoid duplicates
  questionNumber: number;
}

function getSingleQuestionPrompt(context: SingleQuestionContext): string {
  const gradeLabel = GRADE_LABELS[context.gradeLevel] || context.gradeLevel;
  const difficultyDesc = DIFFICULTY_DESCRIPTIONS[context.currentDifficulty];

  const previousQuestionsContext =
    context.previousQuestions.length > 0
      ? `\nQUESTIONS DEJA POSEES (NE PAS REPETER):\n${context.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`
      : "";

  const weakAreasContext =
    context.weakAreas.length > 0
      ? `\nPOINTS FAIBLES A CIBLER: ${context.weakAreas.join(", ")}`
      : "";

  return `Tu es un expert en pedagogie pour Schoolaris. Genere UNE SEULE question de quiz.

CONTEXTE:
- Matiere: ${context.subject}
- Niveau scolaire: ${gradeLabel}
- Lecon: ${context.lessonTitle}
- Question numero: ${context.questionNumber}
- Difficulte: ${context.currentDifficulty.toUpperCase()}
${weakAreasContext}
${previousQuestionsContext}

CONTENU DE LA LECON:
${context.lessonContent.slice(0, 2500)}

NIVEAU "${context.currentDifficulty.toUpperCase()}":
${difficultyDesc}

REGLES:
1. Exactement 4 options (A, B, C, D)
2. Une seule reponse correcte
3. Options incorrectes plausibles
4. Explication pedagogique adaptee a l'age
5. Points: easy=1, medium=2, hard=3
6. NE PAS repeter une question deja posee
7. Si points faibles identifies, cibler ces domaines

FORMAT JSON STRICT:
{
  "question": "La question?",
  "options": [
    { "id": "a", "text": "Option A", "isCorrect": false },
    { "id": "b", "text": "Option B", "isCorrect": true },
    { "id": "c", "text": "Option C", "isCorrect": false },
    { "id": "d", "text": "Option D", "isCorrect": false }
  ],
  "explanation": "Explication pedagogique",
  "difficulty": "${context.currentDifficulty}",
  "points": ${context.currentDifficulty === "easy" ? 1 : context.currentDifficulty === "medium" ? 2 : 3}
}

Reponds UNIQUEMENT avec le JSON.`;
}

const singleQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(optionSchema).length(4),
  explanation: z.string().min(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().min(1).max(3),
});

export async function generateSingleAdaptiveQuestion(
  context: SingleQuestionContext,
): Promise<GeneratedQuestion> {
  const client = getAnthropicClient();
  const prompt = getSingleQuestionPrompt(context);

  try {
    const response = await client.messages.create({
      model: QUIZ_AI_MODEL,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const rawParsed = JSON.parse(jsonMatch[0]);
    const validationResult = singleQuestionSchema.safeParse(rawParsed);

    if (!validationResult.success) {
      console.error(
        "Single question validation failed:",
        validationResult.error.issues,
      );
      return getSingleFallbackQuestion(
        context.currentDifficulty,
        context.questionNumber,
      );
    }

    // Validate exactly one correct answer
    const correctCount = validationResult.data.options.filter(
      (o) => o.isCorrect,
    ).length;
    if (correctCount !== 1) {
      console.error(`Invalid question: ${correctCount} correct answers`);
      return getSingleFallbackQuestion(
        context.currentDifficulty,
        context.questionNumber,
      );
    }

    return validationResult.data;
  } catch (error) {
    console.error("Error generating single question:", error);
    return getSingleFallbackQuestion(
      context.currentDifficulty,
      context.questionNumber,
    );
  }
}

function getSingleFallbackQuestion(
  difficulty: Difficulty,
  questionNumber: number,
): GeneratedQuestion {
  const points = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  return {
    question: `Question ${questionNumber}: Quelle est la notion principale de cette lecon?`,
    options: [
      { id: "a", text: "Reponse A", isCorrect: false },
      { id: "b", text: "La bonne reponse", isCorrect: true },
      { id: "c", text: "Reponse C", isCorrect: false },
      { id: "d", text: "Reponse D", isCorrect: false },
    ],
    explanation:
      "Cette question verifie ta comprehension generale de la lecon.",
    difficulty,
    points,
  };
}
