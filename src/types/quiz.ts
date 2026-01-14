// Quiz Types - Schoolaris
// Types for the adaptive quiz system

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string | null;
  points: number;
  difficulty?: "easy" | "medium" | "hard";
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passingScore: number;
  questions: QuizQuestion[];
  timeLimit?: number; // in seconds, optional
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeSpent?: number; // seconds spent on this question
}

export interface QuizAttempt {
  quizId: string;
  lessonId: string;
  childId: string;
  answers: QuizAnswer[];
  score: number;
  totalPoints: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date;
  timeSpent: number;
}

export interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  feedback?: string; // AI-generated feedback
  recommendations?: string[]; // Areas to improve
  timeExpired?: boolean; // True if quiz was auto-submitted due to time limit
}

export interface QuizSubmissionRequest {
  quizId: string;
  lessonId: string;
  childId: string;
  answers: Record<string, string>; // questionId -> optionId
  timeSpent: number;
}

export interface QuizSubmissionResponse {
  success: boolean;
  result: QuizResult;
  aiExplanation?: string;
}

// Adaptive quiz types
export interface AdaptiveQuizState {
  currentDifficulty: "easy" | "medium" | "hard";
  consecutiveCorrect: number;
  consecutiveWrong: number;
  questionsAnswered: number;
  performanceHistory: Array<{
    difficulty: "easy" | "medium" | "hard";
    correct: boolean;
  }>;
}

// Persistent adaptive learning state (stored in DB)
export interface PersistentAdaptiveState {
  currentDifficulty: "easy" | "medium" | "hard";
  consecutiveCorrect: number;
  consecutiveWrong: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  difficultyBreakdown: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
  currentStreak: number;
  bestStreak: number;
  recentHistory: Array<{
    difficulty: "easy" | "medium" | "hard";
    correct: boolean;
    timestamp: string;
  }>;
  masteryLevel: number;
  totalSessions: number;
  lastSessionAt?: string;
}

export interface AdaptiveLearningContext {
  childId: string;
  subject: string;
  gradeLevel: string;
}

export function calculateNextDifficulty(
  state: AdaptiveQuizState,
): "easy" | "medium" | "hard" {
  // Move up after 2 consecutive correct answers
  if (state.consecutiveCorrect >= 2) {
    if (state.currentDifficulty === "easy") return "medium";
    if (state.currentDifficulty === "medium") return "hard";
  }

  // Move down after 2 consecutive wrong answers
  if (state.consecutiveWrong >= 2) {
    if (state.currentDifficulty === "hard") return "medium";
    if (state.currentDifficulty === "medium") return "easy";
  }

  return state.currentDifficulty;
}
