// AI Exam Mode Generation - Kursus
// AI-powered exam question generation and evaluation for Brevet/Bac preparation

import { getAnthropicClient } from "./ai";
import type {
  ExamGenerationContext,
  ExamQuestion,
  ExamAnalysis,
  ExamSubject,
  QuestionResult,
} from "@/types/exam";

// Using Sonnet for high-quality exam questions
export const EXAM_AI_MODEL = "claude-sonnet-4-20250514";

const GRADE_LABELS: Record<string, string> = {
  CP: "CP (6 ans)",
  CE1: "CE1 (7 ans)",
  CE2: "CE2 (8 ans)",
  CM1: "CM1 (9 ans)",
  CM2: "CM2 (10 ans)",
  SIXIEME: "6eme (11 ans)",
  CINQUIEME: "5eme (12 ans)",
  QUATRIEME: "4eme (13 ans)",
  TROISIEME: "3eme (14 ans) - Brevet",
  SECONDE: "Seconde (15 ans)",
  PREMIERE: "Premiere (16 ans) - Bac",
  TERMINALE: "Terminale (17 ans) - Bac",
};

const SUBJECT_LABELS: Record<ExamSubject, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geographie",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "Sciences de la Vie et de la Terre",
  PHILOSOPHIE: "Philosophie",
};

// Curriculum topics by grade and subject for realistic exam questions
const CURRICULUM_TOPICS: Record<string, Record<ExamSubject, string[]>> = {
  TROISIEME: {
    MATHEMATIQUES: [
      "Theoreme de Pythagore et sa reciproque",
      "Theoreme de Thales et sa reciproque",
      "Trigonometrie (cos, sin, tan)",
      "Fonctions lineaires et affines",
      "Probabilites et statistiques",
      "Calcul litteral et equations",
      "Geometrie dans l'espace (volumes, sections)",
      "Notion de fonction et representation graphique",
    ],
    FRANCAIS: [
      "Argumentation et dissertation",
      "Analyse de texte litteraire",
      "Grammaire et conjugaison",
      "Figures de style et analyse poetique",
      "Comprehension de texte documentaire",
      "Expression ecrite structuree",
    ],
    HISTOIRE_GEO: [
      "Premiere et Seconde Guerre mondiale",
      "La Republique francaise",
      "L'Union europeenne",
      "Dynamiques territoriales de la France",
      "Mondialisation et developpement durable",
    ],
    SCIENCES: [
      "Energie et conversions",
      "Organisation du monde vivant",
      "La Terre et l'environnement",
      "Signaux et communication",
    ],
    ANGLAIS: [
      "Present perfect et past simple",
      "Comparatifs et superlatifs",
      "Comprehension ecrite",
      "Expression ecrite",
      "Vocabulaire quotidien et thematique",
    ],
    PHYSIQUE_CHIMIE: [
      "Atomes et ions",
      "Reactions chimiques",
      "Electricite",
      "Energie et ses conversions",
      "Mouvements et interactions",
    ],
    SVT: [
      "Le corps humain et la sante",
      "La planete Terre et l'environnement",
      "Le vivant et son evolution",
    ],
    PHILOSOPHIE: [],
  },
  TERMINALE: {
    MATHEMATIQUES: [
      "Suites numeriques",
      "Limites et continuite",
      "Derivation et applications",
      "Fonction exponentielle",
      "Fonction logarithme",
      "Integration",
      "Probabilites conditionnelles",
      "Geometrie dans l'espace",
      "Nombres complexes",
    ],
    FRANCAIS: [
      "Dissertation litteraire",
      "Commentaire compose",
      "Contraction de texte",
      "Essai",
    ],
    HISTOIRE_GEO: [
      "Les relations internationales depuis 1945",
      "La France depuis 1945",
      "Dynamiques geographiques des grandes aires continentales",
      "Mondialisation et territoires",
    ],
    SCIENCES: [
      "Science, climat et societe",
      "Le futur des energies",
      "Une histoire du vivant",
    ],
    ANGLAIS: [
      "Expression complexe",
      "Comprehension orale et ecrite",
      "Argumentation en anglais",
      "Litterature anglophone",
    ],
    PHYSIQUE_CHIMIE: [
      "Constitution et transformation de la matiere",
      "Mouvement et interactions",
      "L'energie: conversions et transferts",
      "Ondes et signaux",
    ],
    SVT: [
      "Genetique et evolution",
      "La Terre, la vie et l'organisation du vivant",
      "Corps humain et sante",
      "Ecosystèmes et services environnementaux",
    ],
    PHILOSOPHIE: [
      "La conscience",
      "La liberte",
      "Le devoir",
      "Le bonheur",
      "La verite",
      "L'art",
      "La justice",
      "L'Etat",
    ],
  },
};

function getExamGenerationPrompt(context: ExamGenerationContext): string {
  const gradeLabel = GRADE_LABELS[context.gradeLevel] || context.gradeLevel;
  const subjectLabel = SUBJECT_LABELS[context.subject] || context.subject;
  const topics =
    CURRICULUM_TOPICS[context.gradeLevel]?.[context.subject]?.join(", ") ||
    "programme officiel";

  let performanceContext = "";
  if (context.previousPerformance) {
    performanceContext = `
PERFORMANCE ANTERIEURE DE L'ELEVE:
- Score moyen: ${Math.round(context.previousPerformance.averageScore)}%
- Points faibles: ${context.previousPerformance.weakTopics.join(", ") || "Aucun identifie"}
- Points forts: ${context.previousPerformance.strongTopics.join(", ") || "A determiner"}

Adapte les questions pour cibler les points faibles tout en consolidant les acquis.`;
  }

  const examTypeContext =
    context.examType === "BREVET"
      ? `CONTEXTE EXAMEN:
Tu prepares des questions au format du BREVET DES COLLEGES.
- Respecte le format officiel de l'examen
- Inclus des questions progressives (de facile a difficile)
- Les questions doivent correspondre aux attendus du DNB`
      : context.examType === "BAC"
        ? `CONTEXTE EXAMEN:
Tu prepares des questions au format du BACCALAUREAT.
- Respecte le format officiel de l'epreuve
- Inclus des questions de reflexion et d'analyse
- Les questions doivent correspondre aux attendus du Bac`
        : `CONTEXTE:
Entrainement personnalise adapte au niveau de l'eleve.`;

  return `Tu es un expert en creation de sujets d'examen officiels francais pour ${subjectLabel}.

${examTypeContext}

NIVEAU: ${gradeLabel}
MATIERE: ${subjectLabel}
NOMBRE DE QUESTIONS: ${context.questionCount}
DIFFICULTE: ${context.difficulty === "challenging" ? "Exigeant (pour élèves avances)" : "Standard (niveau attendu)"}

PROGRAMME A COUVRIR:
${topics}
${performanceContext}

TACHE:
Genere ${context.questionCount} questions d'examen variees et realistes.

TYPES DE QUESTIONS A UTILISER (varier les types):
1. "mcq" - QCM avec 4 options (1-2 par examen max)
2. "short_answer" - Reponse courte (definition, calcul simple)
3. "problem_solving" - Problème a resoudre avec etapes
4. "essay" - Question de reflexion (pour Bac uniquement, 1 max)

REGLES STRICTES:
1. Questions conformes au programme officiel francais
2. Progression logique de difficulte
3. Langage clair et precis
4. Points proportionnels a la difficulte
5. Explications pedagogiques pour chaque réponse
6. Erreurs courantes identifiees pour aider l'eleve

FORMAT JSON STRICT:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Question complete et claire",
      "points": 2,
      "timeEstimate": 60,
      "options": [
        { "id": "a", "text": "Option A", "isCorrect": false },
        { "id": "b", "text": "Option B", "isCorrect": true },
        { "id": "c", "text": "Option C", "isCorrect": false },
        { "id": "d", "text": "Option D", "isCorrect": false }
      ],
      "solution": {
        "correctAnswer": "b",
        "explanation": "Explication detaillee de la réponse",
        "keyPoints": ["Point cle 1", "Point cle 2"],
        "commonMistakes": ["Erreur frequente 1"]
      }
    },
    {
      "id": "q2",
      "type": "short_answer",
      "question": "Question necessitant une réponse courte",
      "points": 3,
      "timeEstimate": 90,
      "solution": {
        "correctAnswer": "Reponse attendue",
        "explanation": "Explication de la methode",
        "keyPoints": ["Element essentiel 1", "Element essentiel 2"],
        "commonMistakes": ["Piege classique"]
      }
    },
    {
      "id": "q3",
      "type": "problem_solving",
      "question": "Enonce complet du problème avec contexte",
      "points": 5,
      "timeEstimate": 180,
      "steps": [
        "Etape 1: Identifier les donnees",
        "Etape 2: Appliquer la formule",
        "Etape 3: Calculer le resultat"
      ],
      "solution": {
        "correctAnswer": "42",
        "explanation": "Resolution complete avec justification",
        "keyPoints": ["Concept cle 1", "Concept cle 2"],
        "commonMistakes": ["Oubli d'unite", "Erreur de signe"]
      }
    }
  ]
}

IMPORTANT:
- Reponds UNIQUEMENT avec le JSON valide
- Assure-toi que les questions sont progressives
- Varie les themes couverts dans le programme
- Les explications doivent etre pedagogiques`;
}

export async function generateExamQuestions(
  context: ExamGenerationContext,
): Promise<ExamQuestion[]> {
  const client = getAnthropicClient();
  const prompt = getExamGenerationPrompt(context);

  try {
    const response = await client.messages.create({
      model: EXAM_AI_MODEL,
      max_tokens: 4000,
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

    const parsed = JSON.parse(jsonMatch[0]) as { questions: ExamQuestion[] };

    if (!Array.isArray(parsed.questions)) {
      throw new Error("Invalid response structure");
    }

    return parsed.questions;
  } catch (error) {
    console.error("Error generating exam questions:", error);
    return getFallbackQuestions(context);
  }
}

function getFallbackQuestions(context: ExamGenerationContext): ExamQuestion[] {
  // Basic fallback questions if AI fails
  return [
    {
      id: "fallback_1",
      type: "mcq",
      question:
        "Quelle affirmation est correcte concernant le programme de " +
        SUBJECT_LABELS[context.subject] +
        " ?",
      points: 2,
      timeEstimate: 60,
      options: [
        {
          id: "a",
          text: "Cette question est un exemple de secours",
          isCorrect: true,
        },
        {
          id: "b",
          text: "Le système a rencontre une erreur technique",
          isCorrect: false,
        },
        { id: "c", text: "Veuillez reessayer", isCorrect: false },
        { id: "d", text: "Contactez le support", isCorrect: false },
      ],
      solution: {
        correctAnswer: "a",
        explanation:
          "Cette question de secours est affichee car la generation a rencontre un problème. Veuillez relancer l'examen.",
        keyPoints: ["Question de secours"],
      },
    },
  ];
}

// Evaluate exam answers
export function evaluateExamAnswer(
  question: ExamQuestion,
  userAnswer: string | string[] | number,
): { isCorrect: boolean; score: number; partialCredit?: number } {
  const { type, solution, points } = question;

  switch (type) {
    case "mcq": {
      const correct =
        String(userAnswer).toLowerCase() ===
        String(solution.correctAnswer).toLowerCase();
      return { isCorrect: correct, score: correct ? points : 0 };
    }

    case "short_answer": {
      const normalizedUser = String(userAnswer).toLowerCase().trim();
      const normalizedCorrect = String(solution.correctAnswer)
        .toLowerCase()
        .trim();

      // Exact match
      if (normalizedUser === normalizedCorrect) {
        return { isCorrect: true, score: points };
      }

      // Partial match for keywords in key points
      const keyPoints = solution.keyPoints || [];
      const matchedPoints = keyPoints.filter((point) =>
        normalizedUser.includes(point.toLowerCase()),
      );
      const partial = matchedPoints.length / Math.max(keyPoints.length, 1);

      if (partial >= 0.5) {
        return {
          isCorrect: false,
          score: Math.round(points * partial * 0.7),
          partialCredit: partial * 0.7,
        };
      }

      return { isCorrect: false, score: 0 };
    }

    case "problem_solving": {
      const normalizedUser = String(userAnswer).toLowerCase().trim();
      const normalizedCorrect = String(solution.correctAnswer)
        .toLowerCase()
        .trim();

      // Check for numeric answers with tolerance
      const numUser = parseFloat(normalizedUser);
      const numCorrect = parseFloat(normalizedCorrect);

      if (!isNaN(numUser) && !isNaN(numCorrect)) {
        const tolerance = Math.abs(numCorrect) * 0.01; // 1% tolerance
        if (Math.abs(numUser - numCorrect) <= tolerance) {
          return { isCorrect: true, score: points };
        }
      }

      // String comparison
      if (normalizedUser === normalizedCorrect) {
        return { isCorrect: true, score: points };
      }

      return { isCorrect: false, score: 0 };
    }

    case "essay": {
      // Essay questions need more nuanced evaluation
      // For now, give partial credit based on length and keyword presence
      const answer = String(userAnswer);
      const keyPoints = solution.keyPoints || [];

      if (answer.length < 50) {
        return { isCorrect: false, score: 0 };
      }

      const normalizedAnswer = answer.toLowerCase();
      const matchedPoints = keyPoints.filter((point) =>
        normalizedAnswer.includes(point.toLowerCase()),
      );

      const lengthScore = Math.min(answer.length / 500, 1); // Up to 500 chars
      const keywordScore = matchedPoints.length / Math.max(keyPoints.length, 1);
      const combined = lengthScore * 0.3 + keywordScore * 0.7;

      return {
        isCorrect: combined >= 0.7,
        score: Math.round(points * combined),
        partialCredit: combined,
      };
    }

    default:
      return { isCorrect: false, score: 0 };
  }
}

// Generate comprehensive analysis after exam completion
function getAnalysisPrompt(
  results: QuestionResult[],
  examContext: {
    examType: string;
    subject: ExamSubject;
    gradeLevel: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
  },
): string {
  const subjectLabel = SUBJECT_LABELS[examContext.subject];
  const gradeLabel =
    GRADE_LABELS[examContext.gradeLevel] || examContext.gradeLevel;

  const correctQuestions = results.filter((r) => r.isCorrect);
  const incorrectQuestions = results.filter((r) => !r.isCorrect);

  return `Tu es un professeur expert en ${subjectLabel} qui analyse les resultats d'un examen blanc.

CONTEXTE:
- Type d'examen: ${examContext.examType}
- Matiere: ${subjectLabel}
- Niveau: ${gradeLabel}
- Score: ${examContext.totalScore}/${examContext.maxScore} (${examContext.percentage}%)

QUESTIONS REUSSIES (${correctQuestions.length}):
${correctQuestions.map((r) => `- Score: ${r.score}/${r.maxPoints} pts`).join("\n")}

QUESTIONS ECHOUEES (${incorrectQuestions.length}):
${incorrectQuestions.map((r) => `- Score: ${r.score}/${r.maxPoints} pts - Feedback: ${r.feedback}`).join("\n")}

TACHE:
Fournis une analyse detaillee et encourageante des resultats.

FORMAT JSON STRICT:
{
  "summary": "Resume en 2-3 phrases des performances globales",
  "strengths": ["Force 1", "Force 2"],
  "weaknesses": ["Point a ameliorer 1", "Point a ameliorer 2"],
  "recommendations": ["Conseil concret 1", "Conseil concret 2", "Conseil concret 3"],
  "topicsMastered": ["Theme maitrise 1", "Theme maitrise 2"],
  "topicsToReview": ["Theme a revoir 1", "Theme a revoir 2"],
  "nextSteps": "Prochaines etapes recommandees pour progresser",
  "encouragement": "Message motivant et personnalise pour l'eleve"
}

REGLES:
- Sois constructif et encourageant
- Donne des conseils actionables
- Identifie les themes specifiques du programme
- Maximum 3 elements par liste
- Le message d'encouragement doit etre sincere et adapte au score`;
}

export async function generateExamAnalysis(
  results: QuestionResult[],
  examContext: {
    examType: string;
    subject: ExamSubject;
    gradeLevel: string;
    totalScore: number;
    maxScore: number;
    percentage: number;
  },
): Promise<ExamAnalysis> {
  const client = getAnthropicClient();
  const prompt = getAnalysisPrompt(results, examContext);

  try {
    const response = await client.messages.create({
      model: EXAM_AI_MODEL,
      max_tokens: 1500,
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

    return JSON.parse(jsonMatch[0]) as ExamAnalysis;
  } catch (error) {
    console.error("Error generating exam analysis:", error);
    return getFallbackAnalysis(examContext.percentage);
  }
}

function getFallbackAnalysis(percentage: number): ExamAnalysis {
  const isGood = percentage >= 70;
  const isPassing = percentage >= 50;

  return {
    summary: isGood
      ? "Bonne performance! Tu as demontre une bonne maitrise du programme."
      : isPassing
        ? "Performance correcte. Quelques points restent a consolider."
        : "Cette session montre des axes de progression. Continue tes efforts!",
    strengths: isGood
      ? ["Bonne compréhension générale", "Methodologie correcte"]
      : ["Efforts fournis", "Certaines notions acquises"],
    weaknesses: isPassing
      ? ["Quelques erreurs d'inattention"]
      : ["Certaines notions a revoir", "Methode a consolider"],
    recommendations: [
      "Revise les notions non maitrisees",
      "Refais les exercices similaires",
      "N'hesite pas a demander de l'aide a ton tuteur IA",
    ],
    topicsMastered: ["A determiner avec plus de donnees"],
    topicsToReview: ["A determiner avec plus de donnees"],
    nextSteps:
      "Continue a t'entrainer regulierement pour consolider tes acquis.",
    encouragement: isGood
      ? "Excellent travail! Tu es sur la bonne voie pour reussir ton examen!"
      : isPassing
        ? "Tu progresses! Chaque entrainement te rapproche de ton objectif."
        : "Ne te decourage pas! Chaque erreur est une occasion d'apprendre. Tu vas y arriver!",
  };
}
