"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Target,
  Sparkles,
} from "lucide-react";
import type { Quiz, QuizResult, AdaptiveQuizState } from "@/types/quiz";
import { QuizResults } from "./quiz-results";
import { QuizQuestionHelp } from "./quiz-question-help";
import { QuizTimer } from "./quiz-timer";

interface QuizPlayerProps {
  quiz: Quiz;
  lessonId: string;
  childId?: string;
  onComplete?: (result: QuizResult) => void;
  showHints?: boolean;
  adaptiveMode?: boolean;
  // Context for AI help
  subject?: string;
  gradeLevel?: string;
  lessonTitle?: string;
}

type QuizPhase = "intro" | "playing" | "results";

export function QuizPlayer({
  quiz,
  lessonId,
  childId,
  onComplete,
  showHints = true,
  adaptiveMode = false,
  subject,
  gradeLevel,
  lessonTitle,
}: QuizPlayerProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showExplanation, setShowExplanation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [timePerQuestion, setTimePerQuestion] = useState<
    Record<string, number>
  >({});
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveQuizState>({
    currentDifficulty: "medium",
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    questionsAnswered: 0,
    performanceHistory: [],
  });
  const [showHint, setShowHint] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<
    Record<string, boolean>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  // Timer for current question
  useEffect(() => {
    if (phase === "playing") {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, phase]);

  const startQuiz = useCallback(() => {
    setPhase("playing");
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setIsTimerActive(true);
    setTimeExpired(false);
  }, []);

  const handleSelectAnswer = useCallback(
    (questionId: string, optionId: string) => {
      if (showExplanation) return; // Don't allow changes during explanation

      const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
      setTimePerQuestion((prev) => ({
        ...prev,
        [questionId]: timeSpent,
      }));

      setSelectedAnswers((prev) => ({
        ...prev,
        [questionId]: optionId,
      }));
      setShowHint(false);
    },
    [questionStartTime, showExplanation],
  );

  const checkAnswer = useCallback(() => {
    if (!currentQuestion || !selectedAnswers[currentQuestion.id]) return;

    const selectedOption = selectedAnswers[currentQuestion.id];
    const correctOption = currentQuestion.options.find((o) => o.isCorrect);
    const isCorrect = selectedOption === correctOption?.id;

    setAnsweredCorrectly((prev) => ({
      ...prev,
      [currentQuestion.id]: isCorrect,
    }));

    // Update adaptive state
    if (adaptiveMode) {
      setAdaptiveState((prev) => ({
        ...prev,
        questionsAnswered: prev.questionsAnswered + 1,
        consecutiveCorrect: isCorrect ? prev.consecutiveCorrect + 1 : 0,
        consecutiveWrong: isCorrect ? 0 : prev.consecutiveWrong + 1,
        performanceHistory: [
          ...prev.performanceHistory,
          {
            difficulty: currentQuestion.difficulty || "medium",
            correct: isCorrect,
          },
        ],
      }));
    }

    setShowExplanation(currentQuestion.id);
  }, [currentQuestion, selectedAnswers, adaptiveMode]);

  const goToNextQuestion = useCallback(() => {
    setShowExplanation(null);
    setShowHint(false);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const goToPrevQuestion = useCallback(() => {
    setShowExplanation(null);
    setShowHint(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  const calculateResults = useCallback((): QuizResult => {
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const answers = quiz.questions.map((question) => {
      totalPoints += question.points;
      const selectedOptionId = selectedAnswers[question.id];
      const correctOption = question.options.find((o) => o.isCorrect);
      const isCorrect = selectedOptionId === correctOption?.id;

      if (isCorrect) {
        correctCount++;
        earnedPoints += question.points;
      }

      return {
        questionId: question.id,
        selectedOptionId,
        isCorrect,
        timeSpent: timePerQuestion[question.id] || 0,
      };
    });

    const percentage = Math.round((earnedPoints / totalPoints) * 100);

    return {
      score: earnedPoints,
      totalPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
      correctCount,
      totalQuestions: quiz.questions.length,
      answers,
    };
  }, [quiz, selectedAnswers, timePerQuestion]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setIsTimerActive(false); // Stop timer on submit
    setSubmitError(null);
    const quizResult = calculateResults();
    const totalTimeSpent = Math.round((Date.now() - startTime) / 1000);

    // Add time expired flag to result if applicable
    if (timeExpired) {
      quizResult.timeExpired = true;
    }

    // Save to API if childId is provided
    if (childId) {
      try {
        const response = await fetch("/api/quizzes/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quizId: quiz.id,
            lessonId,
            childId,
            answers: selectedAnswers,
            timeSpent: totalTimeSpent,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.aiExplanation) {
            quizResult.feedback = data.aiExplanation;
          }
        } else {
          // API returned error but we still show results locally
          setSubmitError(
            "La sauvegarde a echoue. Vos resultats sont affiches mais non enregistres.",
          );
        }
      } catch {
        // Network error - still show results but warn user
        setSubmitError(
          "Erreur de connexion. Vos resultats sont affiches mais non enregistres. Verifiez votre connexion et reessayez.",
        );
      }
    }

    setResult(quizResult);
    setPhase("results");
    setIsSubmitting(false);
    onComplete?.(quizResult);
  }, [
    calculateResults,
    startTime,
    childId,
    quiz.id,
    lessonId,
    selectedAnswers,
    onComplete,
    timeExpired,
  ]);

  // Handle timer expiration - defined after handleSubmit to avoid circular dependency
  const handleTimeUp = useCallback(() => {
    setTimeExpired(true);
    setIsTimerActive(false);
    // Auto-submit when time expires - will be called on next render cycle
  }, []);

  // Effect to auto-submit when time expires
  useEffect(() => {
    if (timeExpired && phase === "playing" && !isSubmitting) {
      handleSubmit();
    }
  }, [timeExpired, phase, isSubmitting, handleSubmit]);

  const handleRetry = useCallback(() => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowExplanation(null);
    setResult(null);
    setAnsweredCorrectly({});
    setTimePerQuestion({});
    setSubmitError(null);
    setIsTimerActive(false);
    setTimeExpired(false);
    setAdaptiveState({
      currentDifficulty: "medium",
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      questionsAnswered: 0,
      performanceHistory: [],
    });
    setPhase("intro");
  }, []);

  // Retry submission without restarting the quiz
  const handleRetrySubmit = useCallback(async () => {
    if (!result || !childId) return;

    setIsSubmitting(true);
    setSubmitError(null);
    const totalTimeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      const response = await fetch("/api/quizzes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          lessonId,
          childId,
          answers: selectedAnswers,
          timeSpent: totalTimeSpent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.aiExplanation && result) {
          setResult({ ...result, feedback: data.aiExplanation });
        }
      } else {
        setSubmitError("La sauvegarde a echoue. Veuillez reessayer plus tard.");
      }
    } catch {
      setSubmitError("Erreur de connexion. Verifiez votre connexion internet.");
    } finally {
      setIsSubmitting(false);
    }
  }, [result, childId, startTime, quiz.id, lessonId, selectedAnswers]);

  // Intro Phase
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <HelpCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="mt-2 text-gray-600">{quiz.description}</p>
          )}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>{totalQuestions} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{quiz.passingScore}% pour reussir</span>
            </div>
            {quiz.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{Math.round(quiz.timeLimit / 60)} min</span>
              </div>
            )}
          </div>
          {adaptiveMode && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-emerald-600">
              <Sparkles className="h-4 w-4" />
              <span>Mode adaptatif active</span>
            </div>
          )}
        </div>

        {/* Timer Warning */}
        {quiz.timeLimit && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">Quiz chronometre</p>
                <p className="text-sm text-amber-700">
                  Vous avez{" "}
                  <span className="font-semibold">
                    {Math.floor(quiz.timeLimit / 60)} minutes
                    {quiz.timeLimit % 60 > 0 &&
                      ` et ${quiz.timeLimit % 60} secondes`}
                  </span>{" "}
                  pour completer ce quiz. Le quiz sera automatiquement soumis
                  lorsque le temps sera ecoule.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Instructions</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
              <span>Lisez attentivement chaque question avant de repondre</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
              <span>
                Vous pouvez revenir sur vos réponses avant de terminer
              </span>
            </li>
            {quiz.timeLimit && (
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>
                  Le chronometre demarre des que vous cliquez sur
                  &quot;Commencer&quot;
                </span>
              </li>
            )}
            {showHints && (
              <li className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 text-amber-500" />
                <span>Des indices sont disponibles si vous bloquez</span>
              </li>
            )}
          </ul>
        </div>

        <Button
          onClick={startQuiz}
          className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
          size="lg"
        >
          Commencer le quiz
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Results Phase
  if (phase === "results" && result) {
    return (
      <QuizResults
        result={result}
        quiz={quiz}
        selectedAnswers={selectedAnswers}
        onRetry={handleRetry}
        adaptiveState={adaptiveMode ? adaptiveState : undefined}
        submitError={submitError}
        onRetrySubmit={childId ? handleRetrySubmit : undefined}
      />
    );
  }

  // Playing Phase
  const isCurrentAnswered = !!selectedAnswers[currentQuestion.id];
  const isShowingExplanation = showExplanation === currentQuestion.id;
  const allQuestionsAnswered = answeredCount === totalQuestions;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
          {adaptiveMode && (
            <p className="text-xs text-emerald-600">
              Difficulte: {adaptiveState.currentDifficulty}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Timer */}
          {quiz.timeLimit && (
            <QuizTimer
              totalSeconds={quiz.timeLimit}
              onTimeUp={handleTimeUp}
              isActive={isTimerActive}
              compact
              warningThreshold={Math.min(60, Math.floor(quiz.timeLimit * 0.2))}
              criticalThreshold={Math.min(30, Math.floor(quiz.timeLimit * 0.1))}
            />
          )}
          {/* AI Help Button */}
          {childId && subject && gradeLevel && !isShowingExplanation && (
            <QuizQuestionHelp
              questionText={currentQuestion.question}
              options={currentQuestion.options}
              subject={subject}
              gradeLevel={gradeLevel}
              lessonTitle={lessonTitle || quiz.title}
              difficulty={currentQuestion.difficulty}
              childId={childId}
              variant="button"
            />
          )}
          {showHints && !isShowingExplanation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHint(!showHint)}
              className="gap-1.5 text-amber-600 hover:text-amber-700"
            >
              <Lightbulb className="h-4 w-4" />
              Indice
            </Button>
          )}
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5">
            <HelpCircle className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          className="h-2"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{answeredCount} repondues</span>
          <span>{totalQuestions - answeredCount} restantes</span>
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div className="flex flex-wrap gap-2">
        {quiz.questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => {
              setShowExplanation(null);
              setShowHint(false);
              setCurrentQuestionIndex(idx);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
              idx === currentQuestionIndex
                ? "bg-emerald-500 text-white"
                : selectedAnswers[q.id]
                  ? answeredCorrectly[q.id] === true
                    ? "bg-emerald-100 text-emerald-700"
                    : answeredCorrectly[q.id] === false
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Hint Box */}
      {showHint && currentQuestion.explanation && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-800">Indice</p>
            <p className="mt-1 text-sm text-amber-700">
              Reflechissez bien aux options proposees. Une seule réponse est
              correcte.
            </p>
          </div>
        </div>
      )}

      {/* Current Question */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-600">
            {currentQuestionIndex + 1}
          </span>
          <p className="text-lg font-medium text-gray-900">
            {currentQuestion.question}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected =
              selectedAnswers[currentQuestion.id] === option.id;
            const isCorrectOption = option.isCorrect;

            let optionStyle =
              "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
            if (isShowingExplanation) {
              if (isCorrectOption) {
                optionStyle = "border-emerald-500 bg-emerald-50";
              } else if (isSelected && !isCorrectOption) {
                optionStyle = "border-red-500 bg-red-50";
              }
            } else if (isSelected) {
              optionStyle = "border-emerald-500 bg-emerald-50";
            }

            return (
              <button
                key={option.id}
                onClick={() =>
                  handleSelectAnswer(currentQuestion.id, option.id)
                }
                disabled={isShowingExplanation}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                  optionStyle,
                  isShowingExplanation && "cursor-default",
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isShowingExplanation && isCorrectOption
                      ? "border-emerald-500 bg-emerald-500"
                      : isShowingExplanation && isSelected && !isCorrectOption
                        ? "border-red-500 bg-red-500"
                        : isSelected
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-gray-300",
                  )}
                >
                  {isShowingExplanation && isCorrectOption && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                  {isShowingExplanation && isSelected && !isCorrectOption && (
                    <XCircle className="h-4 w-4 text-white" />
                  )}
                  {!isShowingExplanation && isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-gray-700",
                    isShowingExplanation &&
                      isCorrectOption &&
                      "text-emerald-700 font-medium",
                    isShowingExplanation &&
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
        {isShowingExplanation && currentQuestion.explanation && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Explication</p>
            <p className="mt-1 text-sm text-blue-700">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Precedent
        </Button>

        <div className="flex items-center gap-2">
          {!isShowingExplanation && isCurrentAnswered && (
            <Button
              variant="outline"
              onClick={checkAnswer}
              className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              Verifier
            </Button>
          )}

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  Terminer
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600"
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
