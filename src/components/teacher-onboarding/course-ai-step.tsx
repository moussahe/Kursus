"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Check,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  HelpCircle,
  PenTool,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TeacherOnboardingData } from "@/types/teacher-onboarding";
import type { Subject, GradeLevel } from "@prisma/client";

interface CourseAIStepProps {
  data: TeacherOnboardingData;
  updateData: (updates: Partial<TeacherOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUBJECTS: { value: Subject; label: string }[] = [
  { value: "MATHEMATIQUES", label: "Mathematiques" },
  { value: "FRANCAIS", label: "Francais" },
  { value: "HISTOIRE_GEO", label: "Histoire-Geo" },
  { value: "SCIENCES", label: "Sciences" },
  { value: "ANGLAIS", label: "Anglais" },
  { value: "PHYSIQUE_CHIMIE", label: "Physique-Chimie" },
  { value: "SVT", label: "SVT" },
  { value: "PHILOSOPHIE", label: "Philosophie" },
  { value: "ESPAGNOL", label: "Espagnol" },
  { value: "ALLEMAND", label: "Allemand" },
  { value: "SES", label: "SES" },
  { value: "NSI", label: "NSI" },
];

const GRADE_LEVELS: { value: GradeLevel; label: string }[] = [
  { value: "CP", label: "CP" },
  { value: "CE1", label: "CE1" },
  { value: "CE2", label: "CE2" },
  { value: "CM1", label: "CM1" },
  { value: "CM2", label: "CM2" },
  { value: "SIXIEME", label: "6eme" },
  { value: "CINQUIEME", label: "5eme" },
  { value: "QUATRIEME", label: "4eme" },
  { value: "TROISIEME", label: "3eme" },
  { value: "SECONDE", label: "Seconde" },
  { value: "PREMIERE", label: "Premiere" },
  { value: "TERMINALE", label: "Terminale" },
];

const PRICE_SUGGESTIONS = [
  { value: 1500, label: "15 EUR - Prix d'appel" },
  { value: 2500, label: "25 EUR - Prix recommande" },
  { value: 3500, label: "35 EUR - Premium" },
  { value: 4900, label: "49 EUR - Expertise" },
];

const COURSE_IDEAS = [
  "Les fractions - De la decouverte a la maitrise",
  "La conjugaison francaise simplifiee",
  "La Revolution francaise expliquee",
  "Les bases de l'anglais conversationnel",
  "Preparer le brevet de mathematiques",
];

const lessonTypeIcons = {
  video: Video,
  text: FileText,
  quiz: HelpCircle,
  exercise: PenTool,
};

const lessonTypeLabels = {
  video: "Video",
  text: "Cours",
  quiz: "Quiz",
  exercise: "Exercice",
};

export function CourseAIStep({
  data,
  updateData,
  onNext,
  onBack,
}: CourseAIStepProps) {
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );

  const course = data.course;

  const updateCourse = useCallback(
    (updates: Partial<typeof course>) => {
      updateData({ course: { ...data.course, ...updates } });
    },
    [updateData, data.course],
  );

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Veuillez entrer un sujet");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/course-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          subject:
            data.course.subject ||
            data.profile.specialties[0] ||
            "MATHEMATIQUES",
          gradeLevel: data.course.gradeLevel || "SIXIEME",
          targetDuration: 10,
          additionalInstructions:
            "Creer un cours engageant pour le premier cours d'un nouveau professeur sur la plateforme.",
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erreur de generation");
      }

      // Update course data with AI-generated content
      updateData({
        course: {
          ...data.course,
          title: result.title,
          description: result.description,
          chapters: result.chapters,
          subject:
            data.course.subject ||
            (data.profile.specialties[0] as Subject) ||
            ("MATHEMATIQUES" as Subject),
          gradeLevel: data.course.gradeLevel || ("SIXIEME" as GradeLevel),
        },
      });

      setExpandedChapters(new Set([0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsGenerating(false);
    }
  }, [topic, data.course, data.profile.specialties, updateData]);

  const toggleChapter = (index: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };

  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0,
  );
  const hasGeneratedContent = course.chapters.length > 0;
  const canContinue = hasGeneratedContent && course.price > 0;

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"
        >
          <Sparkles className="h-6 w-6 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900">
          Creez votre premier cours avec l&apos;IA
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Notre assistant va generer une structure complete en quelques secondes
        </p>
      </div>

      {/* Course Generation */}
      {!hasGeneratedContent ? (
        <div className="space-y-5">
          {/* Topic Input */}
          <div>
            <Label htmlFor="topic" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" />
              Sujet de votre cours
            </Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Les fractions, La conjugaison, La Revolution francaise..."
              className="mt-1.5 rounded-xl"
            />
          </div>

          {/* Quick Ideas */}
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">
              Ou choisissez une idee :
            </p>
            <div className="flex flex-wrap gap-2">
              {COURSE_IDEAS.filter((idea) => {
                // Filter based on teacher's specialties
                const specialty = data.profile.specialties[0];
                if (!specialty) return true;
                if (specialty === "MATHEMATIQUES")
                  return idea.includes("fraction") || idea.includes("brevet");
                if (specialty === "FRANCAIS")
                  return idea.includes("conjugaison");
                if (specialty === "HISTOIRE_GEO")
                  return idea.includes("Revolution");
                if (specialty === "ANGLAIS") return idea.includes("anglais");
                return true;
              })
                .slice(0, 3)
                .map((idea) => (
                  <button
                    key={idea}
                    onClick={() => setTopic(idea)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      topic === idea
                        ? "bg-violet-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-violet-100",
                    )}
                  >
                    <Lightbulb className="mr-1 inline h-3 w-3" />
                    {idea}
                  </button>
                ))}
            </div>
          </div>

          {/* Subject & Grade */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Matiere</Label>
              <Select
                value={
                  course.subject ||
                  data.profile.specialties[0] ||
                  "MATHEMATIQUES"
                }
                onValueChange={(v) => updateCourse({ subject: v as Subject })}
              >
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Niveau</Label>
              <Select
                value={course.gradeLevel || "SIXIEME"}
                onValueChange={(v) =>
                  updateCourse({ gradeLevel: v as GradeLevel })
                }
              >
                <SelectTrigger className="mt-1.5 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-6 text-lg font-semibold hover:from-violet-700 hover:to-purple-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                L&apos;IA genere votre cours...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generer avec l&apos;IA
              </>
            )}
          </Button>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-violet-50 p-4 text-center"
            >
              <p className="text-sm text-violet-700">
                L&apos;IA analyse votre sujet et cree une structure pedagogique
                optimale...
              </p>
              <p className="mt-2 text-xs text-violet-500">
                Cela prend generalement 10-15 secondes
              </p>
            </motion.div>
          )}
        </div>
      ) : (
        /* Generated Content Preview */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Course Summary */}
          <Card className="rounded-2xl border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {course.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    updateCourse({ chapters: [], title: "", description: "" })
                  }
                  className="shrink-0 text-gray-500"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.chapters.length} chapitres
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {totalLessons} lecons
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />~
                  {Math.round((totalLessons * 15) / 60)}h de contenu
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter List */}
          <div>
            <h4 className="mb-3 font-semibold text-gray-900">
              Structure du cours
            </h4>
            <div className="space-y-2">
              {course.chapters.map((chapter, chapterIndex) => {
                const isExpanded = expandedChapters.has(chapterIndex);
                const ChapterIcon = isExpanded ? ChevronUp : ChevronDown;

                return (
                  <Card
                    key={chapterIndex}
                    className="overflow-hidden rounded-xl"
                  >
                    <button
                      onClick={() => toggleChapter(chapterIndex)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                          {chapterIndex + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {chapter.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {chapter.lessons.length} lecons
                          </p>
                        </div>
                      </div>
                      <ChapterIcon className="h-5 w-5 text-gray-400" />
                    </button>

                    {isExpanded && (
                      <div className="border-t bg-gray-50 px-4 py-3">
                        <p className="mb-3 text-sm text-gray-600">
                          {chapter.description}
                        </p>
                        <div className="space-y-2">
                          {chapter.lessons.map((lesson, lessonIndex) => {
                            const LessonIcon = lessonTypeIcons[lesson.type];
                            return (
                              <div
                                key={lessonIndex}
                                className="flex items-center gap-3 rounded-lg bg-white p-3"
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                                  <LessonIcon className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {lesson.title}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {lessonTypeLabels[lesson.type]}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Prix de votre cours
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  Choisissez un prix. Vous gardez 70% de chaque vente.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PRICE_SUGGESTIONS.map((price) => (
                    <button
                      key={price.value}
                      onClick={() => updateCourse({ price: price.value })}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-all",
                        course.price === price.value
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-gray-700 hover:bg-emerald-100",
                      )}
                    >
                      {price.label}
                    </button>
                  ))}
                </div>
                {course.price > 0 && (
                  <p className="mt-3 text-sm text-emerald-700">
                    <Check className="mr-1 inline h-4 w-4" />
                    Vous gagnez{" "}
                    <strong>
                      {((course.price * 0.7) / 100).toFixed(2)} EUR
                    </strong>{" "}
                    par vente
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
        >
          Apercu et publication
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {!canContinue && hasGeneratedContent && (
        <p className="text-center text-xs text-gray-500">
          Selectionnez un prix pour continuer
        </p>
      )}
    </div>
  );
}
