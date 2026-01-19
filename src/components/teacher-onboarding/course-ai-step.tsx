"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Layers,
  Zap,
  Calculator,
  BookText,
  Globe,
  FlaskConical,
  Atom,
  Leaf,
  Brain,
  Languages,
  TrendingUp,
  Code,
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
import type {
  TeacherOnboardingData,
  GeneratedChapter,
} from "@/types/teacher-onboarding";
import type { Subject, GradeLevel } from "@prisma/client";

interface CourseAIStepProps {
  data: TeacherOnboardingData;
  updateData: (updates: Partial<TeacherOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUBJECTS: { value: Subject; label: string; icon: typeof Calculator }[] = [
  { value: "MATHEMATIQUES", label: "Mathematiques", icon: Calculator },
  { value: "FRANCAIS", label: "Francais", icon: BookText },
  { value: "HISTOIRE_GEO", label: "Histoire-Geo", icon: Globe },
  { value: "SCIENCES", label: "Sciences", icon: FlaskConical },
  { value: "ANGLAIS", label: "Anglais", icon: Languages },
  { value: "PHYSIQUE_CHIMIE", label: "Physique-Chimie", icon: Atom },
  { value: "SVT", label: "SVT", icon: Leaf },
  { value: "PHILOSOPHIE", label: "Philosophie", icon: Brain },
  { value: "ESPAGNOL", label: "Espagnol", icon: Languages },
  { value: "ALLEMAND", label: "Allemand", icon: Languages },
  { value: "SES", label: "SES", icon: TrendingUp },
  { value: "NSI", label: "NSI", icon: Code },
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
  { value: 1500, label: "15 EUR", description: "Prix d'appel" },
  { value: 2500, label: "25 EUR", description: "Recommande" },
  { value: 3500, label: "35 EUR", description: "Premium" },
  { value: 4900, label: "49 EUR", description: "Expert" },
];

// Subject-specific course templates
const COURSE_TEMPLATES: Record<
  string,
  {
    title: string;
    description: string;
    chapters: GeneratedChapter[];
  }[]
> = {
  MATHEMATIQUES: [
    {
      title: "Maitriser les fractions",
      description:
        "Un cours complet pour comprendre et manipuler les fractions avec confiance.",
      chapters: [
        {
          title: "Introduction aux fractions",
          description: "Decouvrir ce qu'est une fraction",
          lessons: [
            {
              title: "Qu'est-ce qu'une fraction ?",
              description: "Comprendre la notion de fraction",
              duration: 10,
              type: "video",
            },
            {
              title: "Vocabulaire des fractions",
              description: "Numerateur, denominateur et plus",
              duration: 8,
              type: "text",
            },
            {
              title: "Quiz decouverte",
              description: "Testez vos connaissances",
              duration: 5,
              type: "quiz",
            },
          ],
        },
        {
          title: "Fractions equivalentes",
          description: "Simplifier et comparer les fractions",
          lessons: [
            {
              title: "Simplification des fractions",
              description: "Reduire une fraction a sa forme la plus simple",
              duration: 12,
              type: "video",
            },
            {
              title: "Comparaison de fractions",
              description: "Comment comparer deux fractions",
              duration: 10,
              type: "text",
            },
            {
              title: "Exercices pratiques",
              description: "Mettez en pratique vos connaissances",
              duration: 15,
              type: "exercise",
            },
          ],
        },
        {
          title: "Operations sur les fractions",
          description: "Additionner, soustraire, multiplier et diviser",
          lessons: [
            {
              title: "Addition et soustraction",
              description: "Calculer avec des fractions",
              duration: 15,
              type: "video",
            },
            {
              title: "Multiplication et division",
              description: "Operations avancees",
              duration: 15,
              type: "video",
            },
            {
              title: "Problemes concrets",
              description: "Applications dans la vie reelle",
              duration: 20,
              type: "exercise",
            },
            {
              title: "Evaluation finale",
              description: "Testez vos competences",
              duration: 10,
              type: "quiz",
            },
          ],
        },
      ],
    },
    {
      title: "Geometrie : les bases",
      description:
        "Apprendre les figures geometriques et leurs proprietes essentielles.",
      chapters: [
        {
          title: "Les figures planes",
          description: "Triangles, carres, rectangles et cercles",
          lessons: [
            {
              title: "Introduction aux figures",
              description: "Decouvrir les formes geometriques",
              duration: 10,
              type: "video",
            },
            {
              title: "Proprietes des triangles",
              description: "Caracteristiques des triangles",
              duration: 12,
              type: "text",
            },
            {
              title: "Quiz figures planes",
              description: "Testez vos connaissances",
              duration: 8,
              type: "quiz",
            },
          ],
        },
        {
          title: "Perimetres et aires",
          description: "Calculer les mesures des figures",
          lessons: [
            {
              title: "Calcul du perimetre",
              description: "Mesurer le contour des figures",
              duration: 12,
              type: "video",
            },
            {
              title: "Calcul de l'aire",
              description: "Mesurer la surface des figures",
              duration: 12,
              type: "video",
            },
            {
              title: "Exercices de calcul",
              description: "Pratiquez les calculs",
              duration: 15,
              type: "exercise",
            },
          ],
        },
      ],
    },
  ],
  FRANCAIS: [
    {
      title: "Maitriser la conjugaison",
      description:
        "Tous les temps de l'indicatif expliques simplement avec de nombreux exercices.",
      chapters: [
        {
          title: "Le present de l'indicatif",
          description: "Les trois groupes au present",
          lessons: [
            {
              title: "Les verbes du 1er groupe",
              description: "Conjuguer les verbes en -er",
              duration: 10,
              type: "video",
            },
            {
              title: "Les verbes du 2e et 3e groupe",
              description: "Verbes irreguliers et en -ir",
              duration: 12,
              type: "video",
            },
            {
              title: "Exercices de conjugaison",
              description: "Pratiquez la conjugaison",
              duration: 15,
              type: "exercise",
            },
          ],
        },
        {
          title: "Les temps du passe",
          description: "Imparfait, passe simple, passe compose",
          lessons: [
            {
              title: "L'imparfait",
              description: "Decrire le passe",
              duration: 10,
              type: "video",
            },
            {
              title: "Le passe compose",
              description: "Raconter des evenements passes",
              duration: 12,
              type: "video",
            },
            {
              title: "Passe simple vs imparfait",
              description: "Quand utiliser chaque temps",
              duration: 10,
              type: "text",
            },
            {
              title: "Evaluation",
              description: "Testez vos connaissances",
              duration: 10,
              type: "quiz",
            },
          ],
        },
      ],
    },
    {
      title: "Redaction et expression ecrite",
      description:
        "Apprendre a structurer ses idees et rediger des textes clairs.",
      chapters: [
        {
          title: "Les bases de la redaction",
          description: "Structure d'un texte",
          lessons: [
            {
              title: "Introduction, developpement, conclusion",
              description: "Les trois parties d'un texte",
              duration: 15,
              type: "video",
            },
            {
              title: "Les connecteurs logiques",
              description: "Lier ses idees",
              duration: 10,
              type: "text",
            },
            {
              title: "Premier exercice de redaction",
              description: "Ecrivez votre premier texte",
              duration: 20,
              type: "exercise",
            },
          ],
        },
      ],
    },
  ],
  ANGLAIS: [
    {
      title: "Anglais conversationnel - Niveau debutant",
      description:
        "Apprenez a communiquer en anglais dans les situations du quotidien.",
      chapters: [
        {
          title: "Se presenter",
          description: "Les bases de la conversation",
          lessons: [
            {
              title: "Greetings and introductions",
              description: "Comment saluer et se presenter",
              duration: 10,
              type: "video",
            },
            {
              title: "Vocabulaire essentiel",
              description: "Les mots cles a connaitre",
              duration: 8,
              type: "text",
            },
            {
              title: "Dialogue pratique",
              description: "Mettez en pratique",
              duration: 15,
              type: "exercise",
            },
          ],
        },
        {
          title: "La vie quotidienne",
          description: "Parler de sa routine",
          lessons: [
            {
              title: "Daily routine vocabulary",
              description: "Vocabulaire de la vie quotidienne",
              duration: 10,
              type: "video",
            },
            {
              title: "Present simple",
              description: "Decrire des habitudes",
              duration: 12,
              type: "text",
            },
            {
              title: "Quiz time!",
              description: "Testez vos connaissances",
              duration: 8,
              type: "quiz",
            },
          ],
        },
      ],
    },
  ],
  HISTOIRE_GEO: [
    {
      title: "La Revolution francaise",
      description:
        "Comprendre les causes, le deroulement et les consequences de la Revolution.",
      chapters: [
        {
          title: "Les causes de la Revolution",
          description: "La France en 1789",
          lessons: [
            {
              title: "La societe d'Ancien Regime",
              description: "Les trois ordres",
              duration: 12,
              type: "video",
            },
            {
              title: "La crise financiere",
              description: "Les finances du royaume",
              duration: 10,
              type: "text",
            },
            {
              title: "Quiz sur les causes",
              description: "Testez vos connaissances",
              duration: 8,
              type: "quiz",
            },
          ],
        },
        {
          title: "Les grandes etapes",
          description: "De 1789 a 1799",
          lessons: [
            {
              title: "La prise de la Bastille",
              description: "14 juillet 1789",
              duration: 12,
              type: "video",
            },
            {
              title: "La Terreur",
              description: "1793-1794",
              duration: 12,
              type: "video",
            },
            {
              title: "Chronologie a completer",
              description: "Exercice de chronologie",
              duration: 15,
              type: "exercise",
            },
          ],
        },
      ],
    },
  ],
  PHYSIQUE_CHIMIE: [
    {
      title: "Introduction a l'electricite",
      description: "Comprendre les bases des circuits electriques.",
      chapters: [
        {
          title: "Notions fondamentales",
          description: "Tension, intensite, resistance",
          lessons: [
            {
              title: "Qu'est-ce que l'electricite ?",
              description: "Introduction a l'electricite",
              duration: 10,
              type: "video",
            },
            {
              title: "Les grandeurs electriques",
              description: "Volt, Ampere, Ohm",
              duration: 12,
              type: "text",
            },
            {
              title: "Quiz decouverte",
              description: "Testez vos connaissances",
              duration: 8,
              type: "quiz",
            },
          ],
        },
        {
          title: "Les circuits",
          description: "Serie et derivation",
          lessons: [
            {
              title: "Circuit en serie",
              description: "Composants en serie",
              duration: 12,
              type: "video",
            },
            {
              title: "Circuit en derivation",
              description: "Composants en parallele",
              duration: 12,
              type: "video",
            },
            {
              title: "Exercices de schemas",
              description: "Dessinez des circuits",
              duration: 15,
              type: "exercise",
            },
          ],
        },
      ],
    },
  ],
};

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

type CreationMode = "template" | "ai" | null;

export function CourseAIStep({
  data,
  updateData,
  onNext,
  onBack,
}: CourseAIStepProps) {
  const [creationMode, setCreationMode] = useState<CreationMode>(null);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(
    new Set([0]),
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    (data.profile.specialties[0] as Subject) || "MATHEMATIQUES",
  );

  const course = data.course;

  const updateCourse = useCallback(
    (updates: Partial<typeof course>) => {
      updateData({ course: { ...data.course, ...updates } });
    },
    [updateData, data.course],
  );

  // Get templates for selected subject
  const availableTemplates = COURSE_TEMPLATES[selectedSubject] || [];

  const handleSelectTemplate = useCallback(
    (template: (typeof COURSE_TEMPLATES)[string][number]) => {
      updateData({
        course: {
          ...data.course,
          title: template.title,
          description: template.description,
          chapters: template.chapters,
          subject: selectedSubject,
          gradeLevel: data.course.gradeLevel || ("SIXIEME" as GradeLevel),
        },
      });
      setExpandedChapters(new Set([0]));
    },
    [data.course, selectedSubject, updateData],
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
            "Creer un cours engageant et bien structure pour la plateforme Kursus. Le cours doit etre progressif, avec des objectifs clairs pour chaque chapitre.",
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

  const resetSelection = () => {
    setCreationMode(null);
    updateCourse({ chapters: [], title: "", description: "" });
  };

  const totalLessons = course.chapters.reduce(
    (sum, ch) => sum + ch.lessons.length,
    0,
  );
  const hasGeneratedContent = course.chapters.length > 0;
  const canContinue = hasGeneratedContent && course.price > 0;

  return (
    <div className="space-y-6 bg-[var(--kursus-bg)] p-6 sm:p-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7a78ff] to-[#6366f1]"
        >
          <Sparkles className="h-7 w-7 text-white" />
        </motion.div>
        <h2 className="text-xl font-black tracking-tight text-[var(--kursus-text)]">
          Creez votre premier cours
        </h2>
        <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
          Choisissez un template ou laissez l&apos;IA generer votre structure
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Mode Selection */}
        {!creationMode && !hasGeneratedContent && (
          <motion.div
            key="mode-selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {/* Template Option */}
            <button
              onClick={() => setCreationMode("template")}
              className="group rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-6 text-left transition-all hover:border-[#7a78ff] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7a78ff]/20 to-[#6366f1]/20">
                <Layers className="h-6 w-6 text-[#7a78ff]" />
              </div>
              <h3 className="mb-2 font-bold text-[var(--kursus-text)]">
                Utiliser un template
              </h3>
              <p className="text-sm text-[var(--kursus-text-muted)]">
                Cours pre-structures par matiere. Personnalisez et publiez en
                quelques clics.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#7a78ff]">
                <Zap className="h-4 w-4" />
                Le plus rapide
              </div>
            </button>

            {/* AI Option */}
            <button
              onClick={() => setCreationMode("ai")}
              className="group rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-6 text-left transition-all hover:border-[#7a78ff] hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7a78ff]/20 to-[#6366f1]/20">
                <Sparkles className="h-6 w-6 text-[#7a78ff]" />
              </div>
              <h3 className="mb-2 font-bold text-[var(--kursus-text)]">
                Generation IA
              </h3>
              <p className="text-sm text-[var(--kursus-text-muted)]">
                Decrivez votre sujet et notre IA cree une structure complete
                pour vous.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#7a78ff]">
                <Lightbulb className="h-4 w-4" />
                Plus de flexibilite
              </div>
            </button>
          </motion.div>
        )}

        {/* Template Selection Mode */}
        {creationMode === "template" && !hasGeneratedContent && (
          <motion.div
            key="template-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Back button */}
            <button
              onClick={() => setCreationMode(null)}
              className="flex items-center gap-2 text-sm text-[var(--kursus-text-muted)] hover:text-[var(--kursus-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux options
            </button>

            {/* Subject Selection */}
            <div>
              <Label className="text-[var(--kursus-text)]">
                Choisissez une matiere
              </Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUBJECTS.filter(
                  (s) =>
                    COURSE_TEMPLATES[s.value] ||
                    data.profile.specialties.includes(s.value),
                )
                  .slice(0, 6)
                  .map((subject) => {
                    const SubjectIcon = subject.icon;
                    const hasTemplates = COURSE_TEMPLATES[subject.value];
                    return (
                      <button
                        key={subject.value}
                        onClick={() =>
                          setSelectedSubject(subject.value as Subject)
                        }
                        disabled={!hasTemplates}
                        className={cn(
                          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                          selectedSubject === subject.value
                            ? "bg-[#ff9494] text-white"
                            : hasTemplates
                              ? "bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text-muted)] hover:bg-[#ff9494]/10 hover:text-[#ff9494]"
                              : "cursor-not-allowed bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text-muted)] opacity-50",
                        )}
                      >
                        <SubjectIcon className="h-4 w-4" />
                        {subject.label}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Templates List */}
            {availableTemplates.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-[var(--kursus-text)]">
                  Templates disponibles
                </Label>
                {availableTemplates.map((template, idx) => (
                  <Card
                    key={idx}
                    className="cursor-pointer overflow-hidden rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] transition-all hover:border-[#ff9494]"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-[var(--kursus-text)]">
                            {template.title}
                          </h4>
                          <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                            {template.description}
                          </p>
                        </div>
                        <Badge className="shrink-0 bg-[#ff9494]/10 text-[#ff9494]">
                          {template.chapters.length} chapitres
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {template.chapters.slice(0, 3).map((ch, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-[var(--kursus-border)] px-2 py-1 text-xs text-[var(--kursus-text-muted)]"
                          >
                            {ch.title}
                          </span>
                        ))}
                        {template.chapters.length > 3 && (
                          <span className="rounded-full bg-[var(--kursus-border)] px-2 py-1 text-xs text-[var(--kursus-text-muted)]">
                            +{template.chapters.length - 3}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--kursus-border)] p-6 text-center">
                <p className="text-sm text-[var(--kursus-text-muted)]">
                  Pas encore de templates pour cette matiere.
                </p>
                <Button
                  onClick={() => setCreationMode("ai")}
                  variant="link"
                  className="mt-2 text-[#7a78ff]"
                >
                  Utiliser la generation IA a la place
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* AI Generation Mode */}
        {creationMode === "ai" && !hasGeneratedContent && (
          <motion.div
            key="ai-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Back button */}
            <button
              onClick={() => setCreationMode(null)}
              className="flex items-center gap-2 text-sm text-[var(--kursus-text-muted)] hover:text-[var(--kursus-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux options
            </button>

            {/* Topic Input */}
            <div>
              <Label
                htmlFor="topic"
                className="flex items-center gap-2 text-[var(--kursus-text)]"
              >
                <BookOpen className="h-4 w-4 text-[var(--kursus-text-muted)]" />
                Decrivez votre cours
              </Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Les fractions pour les 6eme, La conjugaison au present..."
                className="mt-1.5 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
              />
            </div>

            {/* Subject & Grade */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-[var(--kursus-text)]">Matiere</Label>
                <Select
                  value={
                    course.subject ||
                    data.profile.specialties[0] ||
                    "MATHEMATIQUES"
                  }
                  onValueChange={(v) => updateCourse({ subject: v as Subject })}
                >
                  <SelectTrigger className="mt-1.5 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]">
                    {SUBJECTS.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="text-[var(--kursus-text)]"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[var(--kursus-text)]">Niveau</Label>
                <Select
                  value={course.gradeLevel || "SIXIEME"}
                  onValueChange={(v) =>
                    updateCourse({ gradeLevel: v as GradeLevel })
                  }
                >
                  <SelectTrigger className="mt-1.5 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]">
                    {GRADE_LEVELS.map((l) => (
                      <SelectItem
                        key={l.value}
                        value={l.value}
                        className="text-[var(--kursus-text)]"
                      >
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-[#7a78ff] to-[#6366f1] py-6 text-lg font-semibold hover:from-[#6966ff] hover:to-[#5558e8]"
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
                className="rounded-xl border border-[#7a78ff]/20 bg-[#7a78ff]/10 p-4 text-center"
              >
                <p className="text-sm text-[#7a78ff]">
                  L&apos;IA analyse votre sujet et cree une structure
                  pedagogique optimale...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Generated Content Preview */}
        {hasGeneratedContent && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Course Summary */}
            <Card className="overflow-hidden rounded-2xl border-[#7a78ff]/30 bg-gradient-to-br from-[#7a78ff]/10 to-[#6366f1]/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[var(--kursus-text)]">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                      {course.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetSelection}
                    className="shrink-0 text-[var(--kursus-text-muted)] hover:text-[var(--kursus-text)]"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--kursus-text-muted)]">
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
              <h4 className="mb-3 font-semibold text-[var(--kursus-text)]">
                Structure du cours
              </h4>
              <div className="space-y-2">
                {course.chapters.map((chapter, chapterIndex) => {
                  const isExpanded = expandedChapters.has(chapterIndex);
                  const ChapterIcon = isExpanded ? ChevronUp : ChevronDown;

                  return (
                    <Card
                      key={chapterIndex}
                      className="overflow-hidden rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)]"
                    >
                      <button
                        onClick={() => toggleChapter(chapterIndex)}
                        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--kursus-border)]/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff9494]/20 text-sm font-medium text-[#ff9494]">
                            {chapterIndex + 1}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--kursus-text)]">
                              {chapter.title}
                            </p>
                            <p className="text-xs text-[var(--kursus-text-muted)]">
                              {chapter.lessons.length} lecons
                            </p>
                          </div>
                        </div>
                        <ChapterIcon className="h-5 w-5 text-[var(--kursus-text-muted)]" />
                      </button>

                      {isExpanded && (
                        <div className="border-t border-[var(--kursus-border)] bg-[var(--kursus-bg)] px-4 py-3">
                          <p className="mb-3 text-sm text-[var(--kursus-text-muted)]">
                            {chapter.description}
                          </p>
                          <div className="space-y-2">
                            {chapter.lessons.map((lesson, lessonIndex) => {
                              const LessonIcon = lessonTypeIcons[lesson.type];
                              return (
                                <div
                                  key={lessonIndex}
                                  className="flex items-center gap-3 rounded-lg bg-[var(--kursus-bg-elevated)] p-3"
                                >
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--kursus-border)]">
                                    <LessonIcon className="h-4 w-4 text-[var(--kursus-text-muted)]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[var(--kursus-text)]">
                                      {lesson.title}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-[var(--kursus-border)] text-xs text-[var(--kursus-text-muted)]"
                                  >
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
            <div className="rounded-2xl border border-[#ff9494]/30 bg-[#ff9494]/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ff9494]/20">
                  <DollarSign className="h-5 w-5 text-[#ff9494]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--kursus-text)]">
                    Prix de votre cours
                  </h3>
                  <p className="mt-1 text-sm text-[var(--kursus-text-muted)]">
                    Vous gardez{" "}
                    <span className="font-bold text-[#7a78ff]">70%</span> de
                    chaque vente.
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    {PRICE_SUGGESTIONS.map((price) => (
                      <button
                        key={price.value}
                        onClick={() => updateCourse({ price: price.value })}
                        className={cn(
                          "flex flex-col items-center rounded-xl px-4 py-3 text-sm font-medium transition-all",
                          course.price === price.value
                            ? "bg-[#ff9494] text-white"
                            : "bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] hover:bg-[#ff9494]/20",
                        )}
                      >
                        <span className="text-base font-bold">
                          {price.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs",
                            course.price === price.value
                              ? "text-white/80"
                              : "text-[var(--kursus-text-muted)]",
                          )}
                        >
                          {price.description}
                        </span>
                      </button>
                    ))}
                  </div>
                  {course.price > 0 && (
                    <p className="mt-3 text-sm text-[#7a78ff]">
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
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 rounded-xl border-[var(--kursus-border)] text-[var(--kursus-text)] hover:bg-[var(--kursus-bg-elevated)]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 rounded-xl bg-[#ff9494] text-white hover:bg-[#ff7070]"
        >
          Apercu et publication
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {!canContinue && hasGeneratedContent && (
        <p className="text-center text-xs text-[var(--kursus-text-muted)]">
          Selectionnez un prix pour continuer
        </p>
      )}
    </div>
  );
}
