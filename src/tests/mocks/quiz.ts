// Quiz Test Mocks - Kursus
import type { Quiz, QuizQuestion, QuizOption } from "@/types/quiz";

export const mockOption1: QuizOption = {
  id: "opt-1",
  text: "Paris",
  isCorrect: true,
};

export const mockOption2: QuizOption = {
  id: "opt-2",
  text: "Lyon",
  isCorrect: false,
};

export const mockOption3: QuizOption = {
  id: "opt-3",
  text: "Marseille",
  isCorrect: false,
};

export const mockOption4: QuizOption = {
  id: "opt-4",
  text: "Bordeaux",
  isCorrect: false,
};

export const mockQuestion1: QuizQuestion = {
  id: "q-1",
  question: "Quelle est la capitale de la France ?",
  options: [mockOption1, mockOption2, mockOption3, mockOption4],
  explanation: "Paris est la capitale de la France depuis le Xe siecle.",
  points: 10,
  difficulty: "easy",
};

export const mockQuestion2: QuizQuestion = {
  id: "q-2",
  question: "Combien font 2 + 2 ?",
  options: [
    { id: "opt-2-1", text: "3", isCorrect: false },
    { id: "opt-2-2", text: "4", isCorrect: true },
    { id: "opt-2-3", text: "5", isCorrect: false },
    { id: "opt-2-4", text: "6", isCorrect: false },
  ],
  explanation: "2 + 2 = 4 est une addition de base.",
  points: 10,
  difficulty: "easy",
};

export const mockQuestion3: QuizQuestion = {
  id: "q-3",
  question: "Quel est le symbole chimique de l'eau ?",
  options: [
    { id: "opt-3-1", text: "H2O", isCorrect: true },
    { id: "opt-3-2", text: "CO2", isCorrect: false },
    { id: "opt-3-3", text: "O2", isCorrect: false },
    { id: "opt-3-4", text: "NaCl", isCorrect: false },
  ],
  explanation: "H2O represente une molecule d'eau (2 hydrogenes + 1 oxygene).",
  points: 10,
  difficulty: "medium",
};

export const mockQuiz: Quiz = {
  id: "quiz-1",
  title: "Quiz de Culture Generale",
  description: "Testez vos connaissances generales",
  passingScore: 70,
  questions: [mockQuestion1, mockQuestion2, mockQuestion3],
  timeLimit: 300,
};

export const mockQuizNoTimeLimit: Quiz = {
  id: "quiz-2",
  title: "Quiz sans limite de temps",
  description: null,
  passingScore: 50,
  questions: [mockQuestion1, mockQuestion2],
};

export const mockSingleQuestionQuiz: Quiz = {
  id: "quiz-3",
  title: "Quiz a une question",
  description: "Un quiz simple",
  passingScore: 100,
  questions: [mockQuestion1],
};

export function createMockQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    ...mockQuiz,
    ...overrides,
  };
}

export function createMockQuestion(
  overrides: Partial<QuizQuestion> = {},
): QuizQuestion {
  return {
    ...mockQuestion1,
    id: `q-${Math.random().toString(36).substring(7)}`,
    ...overrides,
  };
}
