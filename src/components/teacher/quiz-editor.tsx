"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation?: string;
  position: number;
}

interface QuizEditorProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
  passingScore: number;
  onPassingScoreChange: (score: number) => void;
  disabled?: boolean;
}

// Generate unique ID
function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function QuizEditor({
  questions,
  onChange,
  passingScore,
  onPassingScoreChange,
  disabled = false,
}: QuizEditorProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set(questions.map((q) => q.id)),
  );

  const toggleQuestion = useCallback((questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const addQuestion = useCallback(() => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      question: "",
      options: [
        { id: generateId(), text: "", isCorrect: true },
        { id: generateId(), text: "", isCorrect: false },
        { id: generateId(), text: "", isCorrect: false },
        { id: generateId(), text: "", isCorrect: false },
      ],
      explanation: "",
      position: questions.length,
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestions((prev) => new Set([...prev, newQuestion.id]));
  }, [questions, onChange]);

  const removeQuestion = useCallback(
    (questionId: string) => {
      const filtered = questions
        .filter((q) => q.id !== questionId)
        .map((q, index) => ({ ...q, position: index }));
      onChange(filtered);
    },
    [questions, onChange],
  );

  const updateQuestion = useCallback(
    (questionId: string, updates: Partial<QuizQuestion>) => {
      onChange(
        questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
      );
    },
    [questions, onChange],
  );

  const updateOption = useCallback(
    (questionId: string, optionId: string, updates: Partial<QuizOption>) => {
      onChange(
        questions.map((q) => {
          if (q.id !== questionId) return q;

          // If setting this option as correct, unset others
          if (updates.isCorrect) {
            return {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === optionId,
              })),
            };
          }

          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, ...updates } : opt,
            ),
          };
        }),
      );
    },
    [questions, onChange],
  );

  const addOption = useCallback(
    (questionId: string) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question || question.options.length >= 6) return;

      const newOption: QuizOption = {
        id: generateId(),
        text: "",
        isCorrect: false,
      };

      onChange(
        questions.map((q) =>
          q.id === questionId
            ? { ...q, options: [...q.options, newOption] }
            : q,
        ),
      );
    },
    [questions, onChange],
  );

  const removeOption = useCallback(
    (questionId: string, optionId: string) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question || question.options.length <= 2) return;

      const filtered = question.options.filter((opt) => opt.id !== optionId);

      // If we removed the correct answer, set the first one as correct
      const hasCorrect = filtered.some((opt) => opt.isCorrect);
      if (!hasCorrect && filtered.length > 0) {
        filtered[0].isCorrect = true;
      }

      onChange(
        questions.map((q) =>
          q.id === questionId ? { ...q, options: filtered } : q,
        ),
      );
    },
    [questions, onChange],
  );

  // Validation
  const validateQuestion = useCallback((question: QuizQuestion) => {
    const errors: string[] = [];

    if (!question.question.trim()) {
      errors.push("La question est requise");
    }

    const filledOptions = question.options.filter((opt) => opt.text.trim());
    if (filledOptions.length < 2) {
      errors.push("Au moins 2 options sont requises");
    }

    const hasCorrect = question.options.some(
      (opt) => opt.isCorrect && opt.text.trim(),
    );
    if (!hasCorrect) {
      errors.push("Une réponse correcte est requise");
    }

    return errors;
  }, []);

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <div className="rounded-xl border bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="passing-score" className="text-sm font-medium">
              Score de réussite (%)
            </Label>
            <p className="text-xs text-gray-500">
              Pourcentage minimum pour valider le quiz
            </p>
          </div>
          <Input
            id="passing-score"
            type="number"
            min={0}
            max={100}
            value={passingScore}
            onChange={(e) => onPassingScoreChange(Number(e.target.value))}
            disabled={disabled}
            className="w-24 rounded-xl text-center"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Questions ({questions.length})
          </h3>
          <Button
            type="button"
            onClick={addQuestion}
            disabled={disabled}
            size="sm"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-2 border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h4 className="text-lg font-semibold text-gray-900">
                Aucune question
              </h4>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter des questions a votre quiz
              </p>
              <Button
                type="button"
                onClick={addQuestion}
                disabled={disabled}
                className="mt-4 rounded-xl bg-emerald-500 hover:bg-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une question
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => {
              const isExpanded = expandedQuestions.has(question.id);
              const errors = validateQuestion(question);
              const hasErrors = errors.length > 0;

              return (
                <Card
                  key={question.id}
                  className={cn(
                    "rounded-2xl border-0 shadow-sm overflow-hidden",
                    hasErrors && "ring-2 ring-red-200",
                  )}
                >
                  {/* Question Header */}
                  <div
                    className={cn(
                      "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                      isExpanded && "border-b",
                    )}
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <button type="button" className="p-1">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Question {index + 1}
                        </span>
                        {hasErrors && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {question.question || "Saisissez votre question..."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(question.id);
                      }}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Content */}
                  {isExpanded && (
                    <CardContent className="p-4 space-y-4 bg-gray-50">
                      {/* Validation Errors */}
                      {hasErrors && (
                        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                          <ul className="list-disc list-inside space-y-1">
                            {errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Question Text */}
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}`}>
                          Question *
                        </Label>
                        <Textarea
                          id={`question-${question.id}`}
                          value={question.question}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              question: e.target.value,
                            })
                          }
                          disabled={disabled}
                          placeholder="Ex: Quel est le resultat de 2 + 2 ?"
                          className="rounded-xl resize-none"
                          rows={2}
                        />
                      </div>

                      {/* Options */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>
                            Reponses * (cliquez pour marquer la bonne)
                          </Label>
                          {question.options.length < 6 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              disabled={disabled}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Option
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  updateOption(question.id, option.id, {
                                    isCorrect: true,
                                  })
                                }
                                disabled={disabled}
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                                  option.isCorrect
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-gray-300 hover:border-gray-400",
                                )}
                              >
                                {option.isCorrect && (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              <Input
                                value={option.text}
                                onChange={(e) =>
                                  updateOption(question.id, option.id, {
                                    text: e.target.value,
                                  })
                                }
                                disabled={disabled}
                                placeholder={`Option ${optIndex + 1}`}
                                className={cn(
                                  "rounded-xl",
                                  option.isCorrect && "ring-2 ring-emerald-200",
                                )}
                              />
                              {question.options.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() =>
                                    removeOption(question.id, option.id)
                                  }
                                  disabled={disabled}
                                  className="shrink-0 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="space-y-2">
                        <Label htmlFor={`explanation-${question.id}`}>
                          Explication (optionnel)
                        </Label>
                        <Textarea
                          id={`explanation-${question.id}`}
                          value={question.explanation || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              explanation: e.target.value,
                            })
                          }
                          disabled={disabled}
                          placeholder="Explication affichee apres la réponse..."
                          className="rounded-xl resize-none"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
