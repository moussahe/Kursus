// Exercise Types for AI-powered Generative Exercises
// Kursus - Exercices Generatifs IA

export type ExerciseType =
  | "FILL_IN_BLANK" // Texte a trous
  | "MATCHING" // Appariement
  | "ORDERING" // Remettre dans l'ordre
  | "SHORT_ANSWER" // Reponse courte
  | "TRUE_FALSE" // Vrai ou Faux
  | "CALCULATION"; // Calcul mathematique

export type Difficulty = "easy" | "medium" | "hard";

// Base exercise content structure
export interface BaseExerciseContent {
  question: string;
  instructions: string;
}

// Fill in the blank exercise
export interface FillInBlankContent extends BaseExerciseContent {
  text: string; // Text with blanks marked as {{blank_1}}, {{blank_2}}
  blanks: Array<{
    id: string;
    hint?: string;
  }>;
}

export interface FillInBlankSolution {
  answers: Record<string, string>; // blank_1: "answer1"
  acceptableVariations?: Record<string, string[]>; // Alternative correct answers
}

// Matching exercise
export interface MatchingContent extends BaseExerciseContent {
  leftItems: Array<{ id: string; text: string }>;
  rightItems: Array<{ id: string; text: string }>;
}

export interface MatchingSolution {
  pairs: Record<string, string>; // left_id: right_id
}

// Ordering exercise
export interface OrderingContent extends BaseExerciseContent {
  items: Array<{ id: string; text: string }>;
}

export interface OrderingSolution {
  correctOrder: string[]; // Array of item IDs in correct order
}

// Short answer exercise
export interface ShortAnswerContent extends BaseExerciseContent {
  maxLength?: number;
  hint?: string;
}

export interface ShortAnswerSolution {
  correctAnswers: string[]; // Multiple acceptable answers
  keywords?: string[]; // Keywords that should be present
}

// True/False exercise
export interface TrueFalseContent extends BaseExerciseContent {
  statements: Array<{
    id: string;
    text: string;
  }>;
}

export interface TrueFalseSolution {
  answers: Record<string, boolean>; // statement_id: true/false
  explanations?: Record<string, string>; // Explanation for each
}

// Calculation exercise
export interface CalculationContent extends BaseExerciseContent {
  problem: string;
  variables?: Record<string, number>; // Variable values if needed
  unit?: string; // Expected unit (e.g., "cm", "kg")
}

export interface CalculationSolution {
  correctAnswer: number;
  tolerance?: number; // Acceptable margin of error
  steps?: string[]; // Step-by-step solution
}

// Union types for content and solution
export type ExerciseContent =
  | FillInBlankContent
  | MatchingContent
  | OrderingContent
  | ShortAnswerContent
  | TrueFalseContent
  | CalculationContent;

export type ExerciseSolution =
  | FillInBlankSolution
  | MatchingSolution
  | OrderingSolution
  | ShortAnswerSolution
  | TrueFalseSolution
  | CalculationSolution;

// Generated exercise from AI
export interface GeneratedExercise {
  type: ExerciseType;
  difficulty: Difficulty;
  content: ExerciseContent;
  solution: ExerciseSolution;
  points: number;
  estimatedTime: number; // in seconds
}

// Exercise generation context
export interface ExerciseGenerationContext {
  subject: string;
  gradeLevel: string;
  lessonTitle: string;
  lessonContent: string;
  difficulty: Difficulty;
  exerciseTypes?: ExerciseType[]; // Preferred types, or all if not specified
  previousPerformance?: {
    correctRate: number;
    weakAreas: string[];
    preferredTypes: ExerciseType[];
  };
}

// Exercise submission
export interface ExerciseAnswer {
  exerciseId: string;
  type: ExerciseType;
  answer: unknown; // Type depends on exercise type
  timeSpent: number;
}

// Exercise result after evaluation
export interface ExerciseResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback: string;
  explanation?: string;
  xpEarned: number;
}

// Exercise feedback context for AI
export interface ExerciseFeedbackContext {
  childName: string;
  gradeLevel: string;
  exerciseType: ExerciseType;
  question: string;
  userAnswer: unknown;
  correctAnswer: unknown;
  isCorrect: boolean;
}

// Exercise session state
export interface ExerciseSessionState {
  currentIndex: number;
  exercises: GeneratedExercise[];
  answers: ExerciseAnswer[];
  results: ExerciseResult[];
  totalScore: number;
  startedAt: Date;
}
