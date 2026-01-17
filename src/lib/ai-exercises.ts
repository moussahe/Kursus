// AI Exercise Generation and Evaluation
// Kursus - Exercices Generatifs IA

import { getAnthropicClient } from "./ai";
import type {
  Difficulty,
  ExerciseType,
  GeneratedExercise,
  ExerciseGenerationContext,
  ExerciseFeedbackContext,
} from "@/types/exercise";

// Using Haiku for fast exercise generation
export const EXERCISE_AI_MODEL = "claude-3-haiku-20240307";

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

const EXERCISE_TYPE_DESCRIPTIONS: Record<ExerciseType, string> = {
  FILL_IN_BLANK:
    "Texte a trous - l'eleve doit completer les espaces vides avec les bons mots",
  MATCHING: "Appariement - l'eleve doit relier des elements de deux colonnes",
  ORDERING:
    "Remise en ordre - l'eleve doit placer des elements dans le bon ordre",
  SHORT_ANSWER:
    "Reponse courte - l'eleve doit ecrire une réponse en quelques mots",
  TRUE_FALSE:
    "Vrai ou Faux - l'eleve doit determiner si des affirmations sont vraies ou fausses",
  CALCULATION:
    "Calcul - l'eleve doit effectuer un calcul mathematique et donner le resultat",
};

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { points: number; timeMultiplier: number }
> = {
  easy: { points: 5, timeMultiplier: 1 },
  medium: { points: 10, timeMultiplier: 1.5 },
  hard: { points: 15, timeMultiplier: 2 },
};

function getExerciseGenerationPrompt(
  context: ExerciseGenerationContext,
): string {
  const gradeLabel = GRADE_LABELS[context.gradeLevel] || context.gradeLevel;
  const exerciseTypes = context.exerciseTypes || [
    "FILL_IN_BLANK",
    "MATCHING",
    "ORDERING",
    "TRUE_FALSE",
    "CALCULATION",
  ];

  const typesDescription = exerciseTypes
    .map((t) => `- ${t}: ${EXERCISE_TYPE_DESCRIPTIONS[t as ExerciseType]}`)
    .join("\n");

  let performanceContext = "";
  if (context.previousPerformance) {
    performanceContext = `
PERFORMANCE PRECEDENTE:
- Taux de réussite: ${Math.round(context.previousPerformance.correctRate * 100)}%
- Points faibles: ${context.previousPerformance.weakAreas.join(", ") || "Aucun"}
- Types preferes: ${context.previousPerformance.preferredTypes.join(", ")}

Adapte les exercices pour cibler les points faibles tout en gardant l'eleve engage.`;
  }

  return `Tu es un expert en pédagogie qui cree des exercices interactifs pour Kursus.

CONTEXTE:
- Matiere: ${context.subject}
- Niveau scolaire: ${gradeLabel}
- Leçon: ${context.lessonTitle}
- Difficulte: ${context.difficulty.toUpperCase()}
${performanceContext}

CONTENU DE LA LECON:
${context.lessonContent.slice(0, 3000)}

TYPES D'EXERCICES DISPONIBLES:
${typesDescription}

TACHE:
Genere 3 exercices varies bases sur le contenu de la lecon, au niveau de difficulte "${context.difficulty}".
Varie les types d'exercices pour maintenir l'engagement.

REGLES:
1. Les exercices doivent etre directement lies au contenu de la lecon
2. Adapte le vocabulaire et la complexite au niveau scolaire
3. Les instructions doivent etre claires et adaptees a l'age
4. Pour les maths: utilise des nombres adaptes au niveau
5. Pour FILL_IN_BLANK: utilise {{blank_1}}, {{blank_2}} etc. dans le texte
6. Pour MATCHING: 4-6 paires maximum
7. Pour ORDERING: 4-6 elements maximum
8. Pour TRUE_FALSE: 3-5 affirmations

FORMAT DE REPONSE (JSON strict):
{
  "exercises": [
    {
      "type": "FILL_IN_BLANK",
      "difficulty": "${context.difficulty}",
      "content": {
        "question": "Titre de l'exercice",
        "instructions": "Complete les espaces vides",
        "text": "La phrase avec {{blank_1}} et {{blank_2}}.",
        "blanks": [
          { "id": "blank_1", "hint": "indice optionnel" },
          { "id": "blank_2" }
        ]
      },
      "solution": {
        "answers": { "blank_1": "réponse1", "blank_2": "réponse2" },
        "acceptableVariations": { "blank_1": ["variation1", "variation2"] }
      },
      "points": ${DIFFICULTY_CONFIG[context.difficulty].points},
      "estimatedTime": 60
    },
    {
      "type": "MATCHING",
      "difficulty": "${context.difficulty}",
      "content": {
        "question": "Titre de l'exercice",
        "instructions": "Relie chaque element de gauche avec son correspondant a droite",
        "leftItems": [
          { "id": "l1", "text": "Element gauche 1" },
          { "id": "l2", "text": "Element gauche 2" }
        ],
        "rightItems": [
          { "id": "r1", "text": "Element droite 1" },
          { "id": "r2", "text": "Element droite 2" }
        ]
      },
      "solution": {
        "pairs": { "l1": "r1", "l2": "r2" }
      },
      "points": ${DIFFICULTY_CONFIG[context.difficulty].points},
      "estimatedTime": 90
    },
    {
      "type": "ORDERING",
      "difficulty": "${context.difficulty}",
      "content": {
        "question": "Titre de l'exercice",
        "instructions": "Remets ces elements dans le bon ordre",
        "items": [
          { "id": "i1", "text": "Element 1" },
          { "id": "i2", "text": "Element 2" },
          { "id": "i3", "text": "Element 3" }
        ]
      },
      "solution": {
        "correctOrder": ["i1", "i2", "i3"]
      },
      "points": ${DIFFICULTY_CONFIG[context.difficulty].points},
      "estimatedTime": 45
    }
  ]
}

Pour TRUE_FALSE:
{
  "type": "TRUE_FALSE",
  "content": {
    "question": "...",
    "instructions": "Indique si chaque affirmation est vraie ou fausse",
    "statements": [
      { "id": "s1", "text": "Affirmation 1" },
      { "id": "s2", "text": "Affirmation 2" }
    ]
  },
  "solution": {
    "answers": { "s1": true, "s2": false },
    "explanations": { "s1": "Explication", "s2": "Explication" }
  }
}

Pour CALCULATION:
{
  "type": "CALCULATION",
  "content": {
    "question": "...",
    "instructions": "Effectue le calcul suivant",
    "problem": "12 + 8 = ?",
    "unit": "cm"
  },
  "solution": {
    "correctAnswer": 20,
    "tolerance": 0.1,
    "steps": ["Etape 1", "Etape 2"]
  }
}

Reponds UNIQUEMENT avec le JSON, sans texte avant ou apres.`;
}

export async function generateExercises(
  context: ExerciseGenerationContext,
): Promise<GeneratedExercise[]> {
  const client = getAnthropicClient();
  const prompt = getExerciseGenerationPrompt(context);

  try {
    const response = await client.messages.create({
      model: EXERCISE_AI_MODEL,
      max_tokens: 3000,
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

    const parsed = JSON.parse(jsonMatch[0]) as {
      exercises: GeneratedExercise[];
    };

    if (!Array.isArray(parsed.exercises)) {
      throw new Error("Invalid response structure");
    }

    return parsed.exercises;
  } catch (error) {
    console.error("Error generating exercises:", error);
    return getFallbackExercises(context.difficulty);
  }
}

function getFallbackExercises(difficulty: Difficulty): GeneratedExercise[] {
  const points = DIFFICULTY_CONFIG[difficulty].points;
  return [
    {
      type: "TRUE_FALSE",
      difficulty,
      content: {
        question: "Verification de compréhension",
        instructions: "Indique si cette affirmation est vraie ou fausse",
        statements: [
          { id: "s1", text: "Cette lecon contient des concepts importants" },
        ],
      },
      solution: {
        answers: { s1: true },
        explanations: {
          s1: "Chaque lecon est concue pour t'apprendre quelque chose de nouveau!",
        },
      },
      points,
      estimatedTime: 30,
    },
  ];
}

// Evaluate an exercise answer
export function evaluateExerciseAnswer(
  exercise: GeneratedExercise,
  userAnswer: unknown,
): { isCorrect: boolean; score: number; partialCredit?: number } {
  const { type, solution, points } = exercise;

  switch (type) {
    case "FILL_IN_BLANK": {
      const sol = solution as {
        answers: Record<string, string>;
        acceptableVariations?: Record<string, string[]>;
      };
      const ans = userAnswer as Record<string, string>;
      let correct = 0;
      const total = Object.keys(sol.answers).length;

      for (const [key, correctAnswer] of Object.entries(sol.answers)) {
        const userAns = (ans[key] || "").toLowerCase().trim();
        const acceptable = [
          correctAnswer.toLowerCase(),
          ...(sol.acceptableVariations?.[key]?.map((v) => v.toLowerCase()) ||
            []),
        ];
        if (acceptable.includes(userAns)) {
          correct++;
        }
      }

      const ratio = correct / total;
      return {
        isCorrect: ratio === 1,
        score: Math.round(points * ratio),
        partialCredit: ratio,
      };
    }

    case "MATCHING": {
      const sol = solution as { pairs: Record<string, string> };
      const ans = userAnswer as Record<string, string>;
      let correct = 0;
      const total = Object.keys(sol.pairs).length;

      for (const [leftId, rightId] of Object.entries(sol.pairs)) {
        if (ans[leftId] === rightId) {
          correct++;
        }
      }

      const ratio = correct / total;
      return {
        isCorrect: ratio === 1,
        score: Math.round(points * ratio),
        partialCredit: ratio,
      };
    }

    case "ORDERING": {
      const sol = solution as { correctOrder: string[] };
      const ans = userAnswer as string[];
      const correct = JSON.stringify(sol.correctOrder) === JSON.stringify(ans);
      return {
        isCorrect: correct,
        score: correct ? points : 0,
      };
    }

    case "TRUE_FALSE": {
      const sol = solution as { answers: Record<string, boolean> };
      const ans = userAnswer as Record<string, boolean>;
      let correct = 0;
      const total = Object.keys(sol.answers).length;

      for (const [key, correctAnswer] of Object.entries(sol.answers)) {
        if (ans[key] === correctAnswer) {
          correct++;
        }
      }

      const ratio = correct / total;
      return {
        isCorrect: ratio === 1,
        score: Math.round(points * ratio),
        partialCredit: ratio,
      };
    }

    case "CALCULATION": {
      const sol = solution as { correctAnswer: number; tolerance?: number };
      const ans = userAnswer as number;
      const tolerance = sol.tolerance || 0;
      const isCorrect = Math.abs(ans - sol.correctAnswer) <= tolerance;
      return {
        isCorrect,
        score: isCorrect ? points : 0,
      };
    }

    case "SHORT_ANSWER": {
      const sol = solution as { correctAnswers: string[]; keywords?: string[] };
      const ans = (userAnswer as string).toLowerCase().trim();

      // Check exact match first
      if (sol.correctAnswers.some((a) => a.toLowerCase() === ans)) {
        return { isCorrect: true, score: points };
      }

      // Check keywords for partial credit
      if (sol.keywords && sol.keywords.length > 0) {
        const matchedKeywords = sol.keywords.filter((k) =>
          ans.includes(k.toLowerCase()),
        );
        const ratio = matchedKeywords.length / sol.keywords.length;
        if (ratio >= 0.5) {
          return {
            isCorrect: false,
            score: Math.round(points * ratio * 0.5),
            partialCredit: ratio * 0.5,
          };
        }
      }

      return { isCorrect: false, score: 0 };
    }

    default:
      return { isCorrect: false, score: 0 };
  }
}

// Generate feedback for exercise attempt
function getExerciseFeedbackPrompt(context: ExerciseFeedbackContext): string {
  const gradeLabel = GRADE_LABELS[context.gradeLevel] || context.gradeLevel;

  return `Tu es un tuteur bienveillant pour Kursus qui donne du feedback sur les exercices.

CONTEXTE:
- Élève: ${context.childName}
- Niveau: ${gradeLabel}
- Type d'exercice: ${context.exerciseType}
- Question: ${context.question}
- Reponse de l'eleve: ${JSON.stringify(context.userAnswer)}
- Reponse correcte: ${JSON.stringify(context.correctAnswer)}
- Resultat: ${context.isCorrect ? "CORRECT" : "INCORRECT"}

TACHE:
Genere un feedback court, encourageant et pedagogique.

FORMAT DE REPONSE (JSON strict):
{
  "feedback": "Message de feedback (2-3 phrases max)",
  "explanation": "Explication de la bonne réponse si incorrect"
}

REGLES:
- Toujours encourageant, meme si incorrect
- Adapte le ton a l'age de l'eleve
- Si correct: felicite brievement
- Si incorrect: explique sans juger et guide vers la compréhension

Reponds UNIQUEMENT avec le JSON.`;
}

export async function generateExerciseFeedback(
  context: ExerciseFeedbackContext,
): Promise<{ feedback: string; explanation?: string }> {
  const client = getAnthropicClient();
  const prompt = getExerciseFeedbackPrompt(context);

  try {
    const response = await client.messages.create({
      model: EXERCISE_AI_MODEL,
      max_tokens: 500,
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

    return JSON.parse(jsonMatch[0]) as {
      feedback: string;
      explanation?: string;
    };
  } catch (error) {
    console.error("Error generating exercise feedback:", error);
    return {
      feedback: context.isCorrect
        ? "Bravo! Tu as trouve la bonne réponse!"
        : "Pas tout a fait. Continue, tu vas y arriver!",
      explanation: context.isCorrect
        ? undefined
        : "Relis bien la lecon pour mieux comprendre ce concept.",
    };
  }
}

// XP rewards for exercises
export const EXERCISE_XP_REWARDS = {
  PERFECT: 15, // All exercises correct
  COMPLETE: 8, // Completed all exercises
  PER_CORRECT: 3, // Per correct exercise
  STREAK_BONUS: 5, // 3+ correct in a row
};

export function calculateExerciseXP(
  results: Array<{ isCorrect: boolean; score: number }>,
): number {
  let xp = 0;
  let streak = 0;
  let allCorrect = true;

  for (const result of results) {
    if (result.isCorrect) {
      xp += EXERCISE_XP_REWARDS.PER_CORRECT;
      streak++;
      if (streak >= 3) {
        xp += EXERCISE_XP_REWARDS.STREAK_BONUS;
        streak = 0; // Reset streak after bonus
      }
    } else {
      allCorrect = false;
      streak = 0;
    }
  }

  // Completion bonus
  xp += EXERCISE_XP_REWARDS.COMPLETE;

  // Perfect bonus
  if (allCorrect && results.length >= 3) {
    xp += EXERCISE_XP_REWARDS.PERFECT;
  }

  return xp;
}
