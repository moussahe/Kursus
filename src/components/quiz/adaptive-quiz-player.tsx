"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Trophy,
  Target,
  Sparkles,
  Loader2,
  Zap,
  RefreshCw,
  Brain,
  TrendingUp,
  TrendingDown,
  Award,
  Flame,
} from "lucide-react";
import { XP_REWARDS } from "@/lib/gamification";
import { useAdaptiveLearningState } from "@/hooks/use-adaptive-learning-state";
import { QuizQuestionHelp } from "./quiz-question-help";

type Difficulty = "easy" | "medium" | "hard";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AdaptiveQuestion {
  question: string;
  options: QuizOption[];
  explanation: string;
  difficulty: Difficulty;
  points: number;
}

interface AdaptiveQuizPlayerProps {
  lessonId: string;
  childId: string;
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  onComplete?: (result: QuizResult) => void;
}

interface QuizResult {
  score: number;
  totalPoints: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  feedback?: AIFeedback;
  xpEarned?: number;
}

interface AIFeedback {
  summary: string;
  encouragement: string;
  areasToReview: string[];
  nextSteps: string;
  difficultyRecommendation: Difficulty;
}

type QuizPhase = "intro" | "loading" | "playing" | "submitting" | "results";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; color: string; icon: typeof Target }
> = {
  easy: { label: "Facile", color: "text-emerald-600", icon: Target },
  medium: { label: "Moyen", color: "text-amber-600", icon: Target },
  hard: { label: "Difficile", color: "text-red-600", icon: Target },
};

export function AdaptiveQuizPlayer({
  lessonId,
  childId,
  lessonTitle,
  subject,
  gradeLevel,
  onComplete,
}: AdaptiveQuizPlayerProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] =
    useState<Difficulty>("medium");
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<
    Record<number, boolean>
  >({});
  const [sessionAnswers, setSessionAnswers] = useState<
    Array<{ difficulty: Difficulty; correct: boolean }>
  >([]);
  const startTimeRef = useRef<number>(0);

  // Persistent adaptive learning state
  const {
    state: persistentState,
    isLoading: isLoadingState,
    initialDifficulty,
    masteryLevel,
    totalSessions,
    bestStreak: historicalBestStreak,
    accuracy: historicalAccuracy,
    saveSessionResults,
  } = useAdaptiveLearningState({
    childId,
    subject,
    gradeLevel,
  });

  // Initialize difficulty from persistent state
  useEffect(() => {
    if (persistentState && phase === "intro") {
      setCurrentDifficulty(initialDifficulty);
      // Restore consecutive counters from previous session
      setConsecutiveCorrect(persistentState.consecutiveCorrect);
      setConsecutiveWrong(persistentState.consecutiveWrong);
    }
  }, [persistentState, initialDifficulty, phase]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = 5; // Target number of questions

  // Fetch initial questions
  const fetchQuestions = useCallback(
    async (difficulty: Difficulty) => {
      try {
        const response = await fetch("/api/quizzes/adaptive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId,
            childId,
            currentDifficulty: difficulty,
            questionCount: 3,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const data = await response.json();
        return data.questions as AdaptiveQuestion[];
      } catch (err) {
        console.error("Error fetching questions:", err);
        throw err;
      }
    },
    [lessonId, childId],
  );

  // Start quiz
  const handleStart = useCallback(async () => {
    setPhase("loading");
    setError(null);
    setSessionAnswers([]); // Reset session answers
    startTimeRef.current = Date.now();

    // Use persisted difficulty or default to medium
    const startDifficulty = initialDifficulty || "medium";

    try {
      const initialQuestions = await fetchQuestions(startDifficulty);
      setQuestions(initialQuestions);
      setCurrentDifficulty(startDifficulty);
      setPhase("playing");
    } catch {
      setError("Impossible de charger les questions. Reessayez.");
      setPhase("intro");
    }
  }, [fetchQuestions, initialDifficulty]);

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    (optionId: string) => {
      if (showExplanation) return;

      setSelectedAnswers((prev) => ({
        ...prev,
        [currentIndex]: optionId,
      }));
    },
    [currentIndex, showExplanation],
  );

  // Check answer and show explanation
  const handleCheckAnswer = useCallback(() => {
    if (!currentQuestion || !selectedAnswers[currentIndex]) return;

    const selectedOption = selectedAnswers[currentIndex];
    const correctOption = currentQuestion.options.find((o) => o.isCorrect);
    const isCorrect = selectedOption === correctOption?.id;

    setAnsweredCorrectly((prev) => ({ ...prev, [currentIndex]: isCorrect }));
    setShowExplanation(true);

    // Track session answer for persistence
    setSessionAnswers((prev) => [
      ...prev,
      { difficulty: currentQuestion.difficulty, correct: isCorrect },
    ]);

    // Update consecutive counters
    if (isCorrect) {
      setConsecutiveCorrect((prev) => prev + 1);
      setConsecutiveWrong(0);
    } else {
      setConsecutiveWrong((prev) => prev + 1);
      setConsecutiveCorrect(0);
    }
  }, [currentQuestion, selectedAnswers, currentIndex]);

  // Calculate next difficulty
  const getNextDifficulty = useCallback((): Difficulty => {
    // Adjust difficulty based on performance
    if (consecutiveCorrect >= 2) {
      if (currentDifficulty === "easy") return "medium";
      if (currentDifficulty === "medium") return "hard";
    }
    if (consecutiveWrong >= 2) {
      if (currentDifficulty === "hard") return "medium";
      if (currentDifficulty === "medium") return "easy";
    }
    return currentDifficulty;
  }, [consecutiveCorrect, consecutiveWrong, currentDifficulty]);

  // Finish and calculate results
  const handleFinish = useCallback(async () => {
    setPhase("submitting");

    // Calculate score
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const answeredQuestions = questions.slice(
      0,
      Math.min(currentIndex + 1, questions.length),
    );

    answeredQuestions.forEach((q, idx) => {
      totalPoints += q.points;
      const selectedId = selectedAnswers[idx];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selectedId === correctOption?.id) {
        correctCount++;
        earnedPoints += q.points;
      }
    });

    const percentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Save adaptive learning state for persistence across sessions
    const finalDifficulty = getNextDifficulty();
    try {
      await saveSessionResults(
        sessionAnswers,
        finalDifficulty,
        consecutiveCorrect,
        consecutiveWrong,
      );
    } catch (err) {
      console.error("Failed to save adaptive state:", err);
      // Continue with quiz submission even if state save fails
    }

    // Submit to server for persistence and XP
    try {
      const response = await fetch("/api/quizzes/adaptive/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          childId,
          score: percentage,
          correctCount,
          totalQuestions: answeredQuestions.length,
          timeSpent,
          questions: answeredQuestions.map((q, idx) => ({
            question: q.question,
            selectedAnswer:
              q.options.find((o) => o.id === selectedAnswers[idx])?.text || "",
            correctAnswer: q.options.find((o) => o.isCorrect)?.text || "",
            isCorrect: answeredCorrectly[idx] ?? false,
          })),
        }),
      });

      const data = await response.json();

      const quizResult: QuizResult = {
        score: earnedPoints,
        totalPoints,
        percentage,
        correctCount,
        totalQuestions: answeredQuestions.length,
        feedback: data.feedback,
        xpEarned: data.xpEarned,
      };

      setResult(quizResult);
      setPhase("results");
      onComplete?.(quizResult);
    } catch {
      // Fallback result without server feedback
      const quizResult: QuizResult = {
        score: earnedPoints,
        totalPoints,
        percentage,
        correctCount,
        totalQuestions: answeredQuestions.length,
      };

      setResult(quizResult);
      setPhase("results");
      onComplete?.(quizResult);
    }
  }, [
    questions,
    currentIndex,
    selectedAnswers,
    answeredCorrectly,
    lessonId,
    childId,
    onComplete,
    sessionAnswers,
    consecutiveCorrect,
    consecutiveWrong,
    getNextDifficulty,
    saveSessionResults,
  ]);

  // Move to next question or finish
  const handleNext = useCallback(async () => {
    setShowExplanation(false);

    // Check if we need more questions
    if (
      currentIndex + 1 >= questions.length &&
      questions.length < totalQuestions
    ) {
      // Fetch more questions with adjusted difficulty
      const nextDifficulty = getNextDifficulty();
      if (nextDifficulty !== currentDifficulty) {
        setCurrentDifficulty(nextDifficulty);
      }

      try {
        const newQuestions = await fetchQuestions(nextDifficulty);
        setQuestions((prev) => [...prev, ...newQuestions]);
      } catch {
        // If fetch fails, finish with current questions
        console.error("Failed to fetch more questions");
      }
    }

    if (
      currentIndex + 1 >= totalQuestions ||
      currentIndex + 1 >= questions.length + 3
    ) {
      // Finish quiz
      handleFinish();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [
    currentIndex,
    questions.length,
    totalQuestions,
    getNextDifficulty,
    currentDifficulty,
    fetchQuestions,
    handleFinish,
  ]);

  // Retry quiz
  const handleRetry = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setAnsweredCorrectly({});
    setResult(null);
    setSessionAnswers([]);
    // Keep difficulty from persistent state for continuity
    if (persistentState) {
      setConsecutiveCorrect(persistentState.consecutiveCorrect);
      setConsecutiveWrong(persistentState.consecutiveWrong);
      setCurrentDifficulty(initialDifficulty);
    } else {
      setConsecutiveCorrect(0);
      setConsecutiveWrong(0);
      setCurrentDifficulty("medium");
    }
    setPhase("intro");
  }, [persistentState, initialDifficulty]);

  // Intro Screen
  if (phase === "intro") {
    const hasPreviousProgress = totalSessions > 0;
    const difficultyLabel = DIFFICULTY_CONFIG[initialDifficulty].label;

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h3 className="mt-4 text-xl font-bold text-gray-900">
            Quiz Adaptatif IA
          </h3>
          <p className="mt-2 text-gray-500">
            L&apos;IA ajuste la difficulte en fonction de tes performances
          </p>

          {/* Previous Progress Stats */}
          {isLoadingState ? (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de ta progression...
            </div>
          ) : hasPreviousProgress ? (
            <div className="mt-4 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4">
              <p className="mb-3 text-sm font-medium text-violet-800">
                Ta progression en {subject}
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-white/80 p-2">
                  <Award className="mx-auto h-4 w-4 text-amber-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {masteryLevel}%
                  </p>
                  <p className="text-xs text-gray-500">Maitrise</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">
                  <Target className="mx-auto h-4 w-4 text-violet-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {historicalAccuracy}%
                  </p>
                  <p className="text-xs text-gray-500">Precision</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">
                  <Flame className="mx-auto h-4 w-4 text-orange-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {historicalBestStreak}
                  </p>
                  <p className="text-xs text-gray-500">Record</p>
                </div>
                <div className="rounded-lg bg-white/80 p-2">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {totalSessions}
                  </p>
                  <p className="text-xs text-gray-500">Sessions</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-violet-600">
                Niveau recommande:{" "}
                <span className="font-semibold">{difficultyLabel}</span>
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-emerald-50 p-3">
                <Sparkles className="mx-auto h-5 w-5 text-emerald-600" />
                <p className="mt-1 font-medium text-emerald-700">
                  Personnalise
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3">
                <TrendingUp className="mx-auto h-5 w-5 text-amber-600" />
                <p className="mt-1 font-medium text-amber-700">Adaptatif</p>
              </div>
              <div className="rounded-xl bg-violet-50 p-3">
                <Target className="mx-auto h-5 w-5 text-violet-600" />
                <p className="mt-1 font-medium text-violet-700">5 questions</p>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-violet-50 p-3">
            <p className="text-sm text-violet-700">
              <Zap className="mr-1 inline h-4 w-4" />
              Gagne jusqu&apos;a{" "}
              <span className="font-semibold">
                +{XP_REWARDS.QUIZ_PERFECT} XP
              </span>{" "}
              avec un score parfait!
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            onClick={handleStart}
            disabled={isLoadingState}
            className="mt-6 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            size="lg"
          >
            {hasPreviousProgress
              ? "Continuer l'entrainement"
              : "Commencer le quiz"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (phase === "loading") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-violet-100" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-violet-600" />
          </div>
          <p className="mt-4 font-medium text-gray-900">
            Generation des questions...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            L&apos;IA cree un quiz adapte a ton niveau
          </p>
        </div>
      </div>
    );
  }

  // Submitting Screen
  if (phase === "submitting") {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="mt-4 font-medium text-gray-900">
            Calcul de ton score...
          </p>
          <p className="mt-1 text-sm text-gray-500">
            L&apos;IA analyse tes réponses
          </p>
        </div>
      </div>
    );
  }

  // Results Screen
  if (phase === "results" && result) {
    const passed = result.percentage >= 70;
    const isPerfect = result.percentage === 100;

    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <div
            className={cn(
              "mx-auto flex h-20 w-20 items-center justify-center rounded-full",
              isPerfect
                ? "bg-gradient-to-br from-amber-400 to-yellow-500"
                : passed
                  ? "bg-emerald-100"
                  : "bg-orange-100",
            )}
          >
            {isPerfect ? (
              <Trophy className="h-10 w-10 text-white" />
            ) : passed ? (
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            ) : (
              <XCircle className="h-10 w-10 text-orange-600" />
            )}
          </div>

          <h3 className="mt-4 text-2xl font-bold text-gray-900">
            {isPerfect ? "Parfait!" : passed ? "Bravo!" : "Continue!"}
          </h3>

          <div
            className={cn(
              "mx-auto mt-4 w-32 rounded-xl py-3",
              passed ? "bg-emerald-100" : "bg-orange-100",
            )}
          >
            <p
              className={cn(
                "text-3xl font-bold",
                passed ? "text-emerald-700" : "text-orange-700",
              )}
            >
              {result.percentage}%
            </p>
          </div>

          <p className="mt-2 text-gray-500">
            {result.correctCount}/{result.totalQuestions} questions correctes
          </p>

          {/* XP Earned */}
          {result.xpEarned && result.xpEarned > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-2 text-white">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">+{result.xpEarned} XP</span>
            </div>
          )}

          {/* AI Feedback */}
          {result.feedback && (
            <div className="mt-6 space-y-4 text-left">
              <div className="rounded-xl bg-violet-50 p-4">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 shrink-0 text-violet-600" />
                  <div>
                    <p className="font-medium text-violet-800">Analyse IA</p>
                    <p className="mt-1 text-sm text-violet-700">
                      {result.feedback.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">
                  <Sparkles className="mr-1 inline h-4 w-4" />
                  {result.feedback.encouragement}
                </p>
              </div>

              {result.feedback.areasToReview.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-medium text-amber-800">A revoir:</p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700">
                    {result.feedback.areasToReview.map((area, idx) => (
                      <li key={idx}>• {area}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  <Lightbulb className="mr-1 inline h-4 w-4" />
                  <span className="font-medium">Conseil:</span>{" "}
                  {result.feedback.nextSteps}
                </p>
              </div>

              {/* Difficulty recommendation */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Prochaine difficulte recommandee:</span>
                <span
                  className={cn(
                    "font-medium",
                    DIFFICULTY_CONFIG[result.feedback.difficultyRecommendation]
                      .color,
                  )}
                >
                  {
                    DIFFICULTY_CONFIG[result.feedback.difficultyRecommendation]
                      .label
                  }
                </span>
                {result.feedback.difficultyRecommendation === "hard" && (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                )}
                {result.feedback.difficultyRecommendation === "easy" && (
                  <TrendingDown className="h-4 w-4 text-amber-500" />
                )}
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={handleRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refaire
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Screen
  if (!currentQuestion) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
          <p className="mt-4 text-gray-500">
            Chargement de la question suivante...
          </p>
        </div>
      </div>
    );
  }

  const selectedAnswer = selectedAnswers[currentIndex];
  const difficultyInfo = DIFFICULTY_CONFIG[currentQuestion.difficulty];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <Brain className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{lessonTitle}</p>
            <p className="text-xs text-gray-500">{subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* AI Help Button */}
          {!showExplanation && (
            <QuizQuestionHelp
              questionText={currentQuestion.question}
              options={currentQuestion.options}
              subject={subject}
              gradeLevel={gradeLevel}
              lessonTitle={lessonTitle}
              difficulty={currentQuestion.difficulty}
              childId={childId}
              variant="icon"
            />
          )}
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
              currentQuestion.difficulty === "easy"
                ? "bg-emerald-100 text-emerald-700"
                : currentQuestion.difficulty === "medium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700",
            )}
          >
            <difficultyInfo.icon className="h-3 w-3" />
            {difficultyInfo.label}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Question {currentIndex + 1} sur {totalQuestions}
          </span>
          <span>{currentQuestion.points} pts</span>
        </div>
        <Progress
          value={((currentIndex + 1) / totalQuestions) * 100}
          className="mt-2 h-2"
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900">
          {currentQuestion.question}
        </h4>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option.id;
          const isCorrectOption = option.isCorrect;

          let optionStyle =
            "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          if (showExplanation) {
            if (isCorrectOption) {
              optionStyle = "border-emerald-500 bg-emerald-50";
            } else if (isSelected && !isCorrectOption) {
              optionStyle = "border-red-500 bg-red-50";
            }
          } else if (isSelected) {
            optionStyle = "border-violet-500 bg-violet-50";
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              disabled={showExplanation}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                optionStyle,
                showExplanation && "cursor-default",
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  showExplanation && isCorrectOption
                    ? "border-emerald-500 bg-emerald-500"
                    : showExplanation && isSelected && !isCorrectOption
                      ? "border-red-500 bg-red-500"
                      : isSelected
                        ? "border-violet-500 bg-violet-500"
                        : "border-gray-300",
                )}
              >
                {showExplanation && isCorrectOption && (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                )}
                {showExplanation && isSelected && !isCorrectOption && (
                  <XCircle className="h-4 w-4 text-white" />
                )}
                {!showExplanation && isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <span
                className={cn(
                  "text-gray-700",
                  showExplanation &&
                    isCorrectOption &&
                    "text-emerald-700 font-medium",
                  showExplanation &&
                    isSelected &&
                    !isCorrectOption &&
                    "text-red-700",
                )}
              >
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {showExplanation && currentQuestion.explanation && (
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">Explication</p>
          <p className="mt-1 text-sm text-blue-700">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3">
        {!showExplanation && selectedAnswer && (
          <Button
            onClick={handleCheckAnswer}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Verifier
          </Button>
        )}

        {showExplanation && (
          <Button
            onClick={handleNext}
            className="gap-2 bg-violet-600 hover:bg-violet-700"
          >
            {currentIndex + 1 >= totalQuestions
              ? "Voir les resultats"
              : "Suivant"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
