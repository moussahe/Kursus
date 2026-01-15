"use client";

import { useState } from "react";
import {
  Sparkles,
  Loader2,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Check,
  FileText,
  Video,
  HelpCircle,
  PenTool,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GeneratedLesson {
  title: string;
  description: string;
  duration: number;
  type: "video" | "text" | "quiz" | "exercise";
}

interface GeneratedChapter {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

interface GeneratedCourseStructure {
  title: string;
  subtitle: string;
  description: string;
  learningOutcomes: string[];
  requirements: string[];
  chapters: GeneratedChapter[];
  estimatedDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface AICourseBuilderProps {
  onApply: (structure: GeneratedCourseStructure) => void;
  defaultSubject?: string;
  defaultGradeLevel?: string;
}

const subjects = [
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

const gradeLevels = [
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

const difficultyLabels = {
  beginner: "Debutant",
  intermediate: "Intermediaire",
  advanced: "Avance",
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-amber-100 text-amber-700",
  advanced: "bg-red-100 text-red-700",
};

export function AICourseBuilder({
  onApply,
  defaultSubject = "MATHEMATIQUES",
  defaultGradeLevel = "SIXIEME",
}: AICourseBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [gradeLevel, setGradeLevel] = useState(defaultGradeLevel);
  const [targetDuration, setTargetDuration] = useState(10);
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [structure, setStructure] = useState<GeneratedCourseStructure | null>(
    null,
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Veuillez entrer un sujet");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStructure(null);

    try {
      const res = await fetch("/api/ai/course-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          subject,
          gradeLevel,
          targetDuration,
          additionalInstructions: additionalInstructions || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de generation");
      }

      setStructure(data);
      setExpandedChapters(new Set([0]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleChapter = (index: number) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedChapters(newExpanded);
  };

  const handleApply = () => {
    if (structure) {
      onApply(structure);
      setIsOpen(false);
      setStructure(null);
      setTopic("");
    }
  };

  const totalLessons =
    structure?.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 rounded-xl border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
        >
          <Wand2 className="h-4 w-4" />
          Generer avec l&apos;IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Assistant IA - Creation de cours
          </DialogTitle>
          <DialogDescription>
            Decrivez votre cours et l&apos;IA generera une structure complete
            avec chapitres et leçons.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Input Form */}
          {!structure && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="topic">Sujet du cours *</Label>
                <Input
                  id="topic"
                  placeholder="Ex: Les angles, Les fractions, La Revolution francaise..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Matiere</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Niveau</Label>
                  <Select value={gradeLevel} onValueChange={setGradeLevel}>
                    <SelectTrigger className="mt-1 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Duree cible (heures)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={50}
                  value={targetDuration}
                  onChange={(e) =>
                    setTargetDuration(parseInt(e.target.value) || 10)
                  }
                  className="mt-1 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="instructions">
                  Instructions supplementaires
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Ex: Mettre l'accent sur les exercices pratiques, inclure des exemples de la vie quotidienne..."
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  className="mt-1 rounded-xl"
                  rows={3}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full rounded-xl bg-violet-600 hover:bg-violet-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generation en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generer la structure
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Generated Structure Preview */}
          {structure && (
            <div className="space-y-6">
              {/* Course Header */}
              <Card className="rounded-2xl border-violet-100 bg-gradient-to-br from-violet-50 to-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {structure.title}
                      </h3>
                      <p className="mt-1 text-gray-600">{structure.subtitle}</p>
                    </div>
                    <Badge
                      className={cn(difficultyColors[structure.difficulty])}
                    >
                      {difficultyLabels[structure.difficulty]}
                    </Badge>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    {structure.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {structure.chapters.length} chapitres
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {totalLessons} leçons
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />~
                      {structure.estimatedDuration}h
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Learning Outcomes */}
              <div>
                <h4 className="mb-2 font-medium text-gray-900">
                  Objectifs d&apos;apprentissage
                </h4>
                <ul className="space-y-1">
                  {structure.learningOutcomes.map((outcome, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chapters */}
              <div>
                <h4 className="mb-3 font-medium text-gray-900">
                  Structure du cours
                </h4>
                <div className="space-y-2">
                  {structure.chapters.map((chapter, chapterIndex) => {
                    const isExpanded = expandedChapters.has(chapterIndex);
                    const ChapterIcon = isExpanded ? ChevronUp : ChevronDown;

                    return (
                      <Card key={chapterIndex} className="rounded-xl">
                        <button
                          onClick={() => toggleChapter(chapterIndex)}
                          className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-700">
                              {chapterIndex + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {chapter.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {chapter.lessons.length} leçons
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
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900">
                                        {lesson.title}
                                      </p>
                                      <p className="truncate text-xs text-gray-500">
                                        {lesson.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {lessonTypeLabels[lesson.type]}
                                      </Badge>
                                      <span>{lesson.duration} min</span>
                                    </div>
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

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStructure(null)}
                  className="flex-1 rounded-xl"
                >
                  Regenerer
                </Button>
                <Button
                  onClick={handleApply}
                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Appliquer cette structure
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
