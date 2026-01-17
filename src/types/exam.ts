// Exam Mode Types - Kursus
// Types for the AI-powered exam revision system

export type ExamType = "BREVET" | "BAC" | "CUSTOM";

export type ExamSubject =
  | "MATHEMATIQUES"
  | "FRANCAIS"
  | "HISTOIRE_GEO"
  | "SCIENCES"
  | "ANGLAIS"
  | "PHYSIQUE_CHIMIE"
  | "SVT"
  | "PHILOSOPHIE";

export interface ExamConfig {
  type: ExamType;
  subject: ExamSubject;
  duration: number; // in minutes
  questionCount: number;
  difficulty: "standard" | "challenging";
}

export interface ExamQuestion {
  id: string;
  type: "mcq" | "short_answer" | "problem_solving" | "essay";
  question: string;
  points: number;
  timeEstimate: number; // estimated time in seconds
  // For MCQ
  options?: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  // For problem solving
  steps?: string[];
  // Solution and explanation
  solution: {
    correctAnswer: string | string[] | number;
    explanation: string;
    keyPoints: string[];
    commonMistakes?: string[];
  };
}

export interface ExamSession {
  id: string;
  childId: string;
  examType: ExamType;
  subject: ExamSubject;
  gradeLevel: string;
  questions: ExamQuestion[];
  duration: number;
  startedAt: Date;
  endsAt: Date;
  status: "in_progress" | "completed" | "abandoned";
}

export interface ExamAnswer {
  questionId: string;
  answer: string | string[] | number;
  timeSpent: number;
}

export interface ExamResult {
  sessionId: string;
  childId: string;
  examType: ExamType;
  subject: ExamSubject;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string; // "Tres Bien", "Bien", "Assez Bien", "Passable", "Insuffisant"
  timeSpent: number; // in seconds
  questionResults: QuestionResult[];
  aiAnalysis: ExamAnalysis;
  xpEarned: number;
  completedAt: Date;
}

export interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  partialCredit?: number; // 0-1 for partial correctness
  score: number;
  maxPoints: number;
  userAnswer: string | string[] | number;
  feedback: string;
  explanation: string;
}

export interface ExamAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  topicsMastered: string[];
  topicsToReview: string[];
  nextSteps: string;
  encouragement: string;
}

export interface ExamGenerationContext {
  examType: ExamType;
  subject: ExamSubject;
  gradeLevel: string;
  questionCount: number;
  difficulty: "standard" | "challenging";
  previousPerformance?: {
    averageScore: number;
    weakTopics: string[];
    strongTopics: string[];
  };
}

// Exam configuration by type
export const EXAM_CONFIGS: Record<
  ExamType,
  {
    label: string;
    gradeLevels: string[];
    defaultDuration: number;
    defaultQuestionCount: number;
  }
> = {
  BREVET: {
    label: "Brevet des colleges",
    gradeLevels: ["TROISIEME"],
    defaultDuration: 60,
    defaultQuestionCount: 10,
  },
  BAC: {
    label: "Baccalaureat",
    gradeLevels: ["PREMIERE", "TERMINALE"],
    defaultDuration: 90,
    defaultQuestionCount: 12,
  },
  CUSTOM: {
    label: "Entrainement personnalise",
    gradeLevels: [
      "CP",
      "CE1",
      "CE2",
      "CM1",
      "CM2",
      "SIXIEME",
      "CINQUIEME",
      "QUATRIEME",
      "TROISIEME",
      "SECONDE",
      "PREMIERE",
      "TERMINALE",
    ],
    defaultDuration: 30,
    defaultQuestionCount: 8,
  },
};

// Grade calculation based on percentage
export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "Tres Bien";
  if (percentage >= 80) return "Bien";
  if (percentage >= 70) return "Assez Bien";
  if (percentage >= 50) return "Passable";
  return "Insuffisant";
}

// XP rewards for exam mode
export const EXAM_XP_REWARDS = {
  COMPLETION: 25,
  PASSING: 50, // >= 50%
  GOOD: 75, // >= 70%
  EXCELLENT: 100, // >= 90%
  PERFECT: 150, // 100%
  PER_CORRECT_QUESTION: 5,
};

export function calculateExamXP(
  percentage: number,
  correctQuestions: number,
): number {
  let xp = EXAM_XP_REWARDS.COMPLETION;
  xp += correctQuestions * EXAM_XP_REWARDS.PER_CORRECT_QUESTION;

  if (percentage === 100) {
    xp += EXAM_XP_REWARDS.PERFECT;
  } else if (percentage >= 90) {
    xp += EXAM_XP_REWARDS.EXCELLENT;
  } else if (percentage >= 70) {
    xp += EXAM_XP_REWARDS.GOOD;
  } else if (percentage >= 50) {
    xp += EXAM_XP_REWARDS.PASSING;
  }

  return xp;
}
