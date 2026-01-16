"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PlayCircle,
  FileText,
  HelpCircle,
  FileIcon,
  Loader2,
  Save,
  X,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  QuizEditor,
  type QuizQuestion,
} from "@/components/teacher/quiz-editor";

const lessonSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caracteres"),
  description: z.string().optional(),
  contentType: z.enum(["VIDEO", "TEXT", "QUIZ", "DOCUMENT", "EXERCISE"]),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  duration: z.coerce.number().min(0).optional(),
  isPublished: z.boolean().default(false),
  isFreePreview: z.boolean().default(false),
  quizQuestions: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().min(1, "La question est requise"),
        options: z
          .array(
            z.object({
              id: z.string(),
              text: z.string(),
              isCorrect: z.boolean(),
            }),
          )
          .min(2, "Au moins 2 options requises"),
        explanation: z.string().optional(),
        position: z.number(),
      }),
    )
    .optional(),
  quizPassingScore: z.number().min(0).max(100).optional(),
});

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  content?: string | null;
  videoUrl?: string | null;
  duration: number | null;
  position: number;
  isPublished: boolean;
  isFreePreview: boolean;
  quizQuestions?: QuizQuestion[];
  quizPassingScore?: number;
}

interface LessonFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  chapterId: string;
  lesson?: Lesson;
  onSuccess: (lesson: Lesson) => void;
}

const contentTypes = [
  {
    value: "VIDEO",
    label: "Video",
    icon: PlayCircle,
    description: "Lecon video",
    color: "emerald",
  },
  {
    value: "TEXT",
    label: "Texte",
    icon: FileText,
    description: "Contenu textuel",
    color: "blue",
  },
  {
    value: "QUIZ",
    label: "Quiz",
    icon: HelpCircle,
    description: "Questions interactives",
    color: "violet",
  },
  {
    value: "DOCUMENT",
    label: "Document",
    icon: FileIcon,
    description: "PDF, documents",
    color: "amber",
  },
  {
    value: "EXERCISE",
    label: "Exercice",
    icon: HelpCircle,
    description: "Exercices pratiques",
    color: "rose",
  },
] as const;

// Component for animated conditional fields
function AnimatedSection({
  show,
  children,
}: {
  show: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        show ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );
}

// Content type selection card
function ContentTypeCard({
  type,
  isSelected,
  onClick,
}: {
  type: (typeof contentTypes)[number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = type.icon;

  const colorClasses = {
    emerald: {
      selected: "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/30",
      icon: "text-emerald-600",
      text: "text-emerald-700",
      description: "text-emerald-600/70",
    },
    blue: {
      selected: "border-blue-500 bg-blue-50 ring-2 ring-blue-500/30",
      icon: "text-blue-600",
      text: "text-blue-700",
      description: "text-blue-600/70",
    },
    violet: {
      selected: "border-violet-500 bg-violet-50 ring-2 ring-violet-500/30",
      icon: "text-violet-600",
      text: "text-violet-700",
      description: "text-violet-600/70",
    },
    amber: {
      selected: "border-amber-500 bg-amber-50 ring-2 ring-amber-500/30",
      icon: "text-amber-600",
      text: "text-amber-700",
      description: "text-amber-600/70",
    },
    rose: {
      selected: "border-rose-500 bg-rose-50 ring-2 ring-rose-500/30",
      icon: "text-rose-600",
      text: "text-rose-700",
      description: "text-rose-600/70",
    },
  };

  const colors = colorClasses[type.color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
        isSelected
          ? colors.selected
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm",
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -right-1 -top-1">
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full",
              type.color === "emerald" && "bg-emerald-500",
              type.color === "blue" && "bg-blue-500",
              type.color === "violet" && "bg-violet-500",
              type.color === "amber" && "bg-amber-500",
              type.color === "rose" && "bg-rose-500",
            )}
          >
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
          isSelected
            ? cn(
                type.color === "emerald" && "bg-emerald-100",
                type.color === "blue" && "bg-blue-100",
                type.color === "violet" && "bg-violet-100",
                type.color === "amber" && "bg-amber-100",
                type.color === "rose" && "bg-rose-100",
              )
            : "bg-gray-100 group-hover:bg-gray-200",
        )}
      >
        <Icon
          className={cn(
            "h-6 w-6 transition-colors duration-200",
            isSelected
              ? colors.icon
              : "text-gray-400 group-hover:text-gray-500",
          )}
        />
      </div>
      <span
        className={cn(
          "text-sm font-semibold transition-colors duration-200",
          isSelected ? colors.text : "text-gray-700",
        )}
      >
        {type.label}
      </span>
      <span
        className={cn(
          "text-xs transition-colors duration-200",
          isSelected ? colors.description : "text-gray-400",
        )}
      >
        {type.description}
      </span>
    </button>
  );
}

export function LessonForm({
  open,
  onOpenChange,
  courseId,
  chapterId,
  lesson,
  onSuccess,
}: LessonFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!lesson;

  // Quiz state (separate from form for better UX)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(
    lesson?.quizQuestions ?? [],
  );
  const [quizPassingScore, setQuizPassingScore] = useState(
    lesson?.quizPassingScore ?? 70,
  );

  const form = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title ?? "",
      description: lesson?.description ?? "",
      contentType: (lesson?.contentType ?? "VIDEO") as
        | "VIDEO"
        | "TEXT"
        | "QUIZ"
        | "DOCUMENT"
        | "EXERCISE",
      content: lesson?.content ?? "",
      videoUrl: lesson?.videoUrl ?? "",
      duration: lesson?.duration ?? undefined,
      isPublished: lesson?.isPublished ?? false,
      isFreePreview: lesson?.isFreePreview ?? false,
      quizQuestions: lesson?.quizQuestions ?? [],
      quizPassingScore: lesson?.quizPassingScore ?? 70,
    },
  });

  const contentType = form.watch("contentType");
  const { errors } = form.formState;

  // Reset form when lesson changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: lesson?.title ?? "",
        description: lesson?.description ?? "",
        contentType: (lesson?.contentType ?? "VIDEO") as
          | "VIDEO"
          | "TEXT"
          | "QUIZ"
          | "DOCUMENT"
          | "EXERCISE",
        content: lesson?.content ?? "",
        videoUrl: lesson?.videoUrl ?? "",
        duration: lesson?.duration ?? undefined,
        isPublished: lesson?.isPublished ?? false,
        isFreePreview: lesson?.isFreePreview ?? false,
      });
      setQuizQuestions(lesson?.quizQuestions ?? []);
      setQuizPassingScore(lesson?.quizPassingScore ?? 70);
    }
  }, [open, lesson, form]);

  const onSubmit = async (values: z.infer<typeof lessonSchema>) => {
    setIsSubmitting(true);

    try {
      // Validate quiz questions if content type is QUIZ
      if (values.contentType === "QUIZ") {
        if (quizQuestions.length === 0) {
          toast.error("Ajoutez au moins une question au quiz");
          setIsSubmitting(false);
          return;
        }

        // Validate each question
        for (let i = 0; i < quizQuestions.length; i++) {
          const q = quizQuestions[i];
          if (!q.question.trim()) {
            toast.error(
              `Question ${i + 1}: Le texte de la question est requis`,
            );
            setIsSubmitting(false);
            return;
          }
          const filledOptions = q.options.filter((opt) => opt.text.trim());
          if (filledOptions.length < 2) {
            toast.error(`Question ${i + 1}: Au moins 2 options sont requises`);
            setIsSubmitting(false);
            return;
          }
          const hasCorrect = q.options.some(
            (opt) => opt.isCorrect && opt.text.trim(),
          );
          if (!hasCorrect) {
            toast.error(`Question ${i + 1}: Une reponse correcte est requise`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      const url = isEditing
        ? `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`
        : `/api/courses/${courseId}/chapters/${chapterId}/lessons`;

      // Include quiz data if content type is QUIZ
      const payload = {
        ...values,
        ...(values.contentType === "QUIZ" && {
          quizQuestions,
          quizPassingScore,
        }),
      };

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      const savedLesson = await response.json();
      toast.success(
        isEditing ? "Lecon mise a jour avec succes" : "Lecon creee avec succes",
      );
      onSuccess(savedLesson);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col p-0 sm:max-w-xl"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Modifier la lecon" : "Ajouter une lecon"}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">
              {isEditing
                ? "Modifiez les details de votre lecon"
                : "Remplissez les informations pour creer une nouvelle lecon"}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              id="lesson-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Titre de la lecon <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Introduction aux nombres decimaux"
                        className={cn(
                          "h-11 rounded-xl border-gray-200 bg-gray-50 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20",
                          errors.title &&
                            "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20",
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Decrivez brievement le contenu de cette lecon..."
                        className="min-h-[100px] resize-none rounded-xl border-gray-200 bg-gray-50 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Content Type */}
              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Type de contenu <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {contentTypes.map((type) => (
                        <ContentTypeCard
                          key={type.value}
                          type={type}
                          isSelected={field.value === type.value}
                          onClick={() => field.onChange(type.value)}
                        />
                      ))}
                    </div>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Conditional Fields with Smooth Transitions */}

              {/* Video URL (shown for VIDEO type) */}
              <AnimatedSection show={contentType === "VIDEO"}>
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <PlayCircle className="h-4 w-4" />
                        URL de la video
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="h-11 rounded-xl border-emerald-200 bg-white transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-emerald-600/70">
                        Lien YouTube, Vimeo ou autre plateforme video
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </AnimatedSection>

              {/* Content (shown for TEXT type) */}
              <AnimatedSection show={contentType === "TEXT"}>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <FormLabel className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <FileText className="h-4 w-4" />
                        Contenu textuel
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ecrivez le contenu de votre lecon..."
                          className="min-h-[200px] resize-none rounded-xl border-blue-200 bg-white transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-blue-600/70">
                        Redigez le contenu textuel de votre lecon
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </AnimatedSection>

              {/* Quiz Editor (shown for QUIZ type) */}
              <AnimatedSection show={contentType === "QUIZ"}>
                <div className="space-y-2 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <FormLabel className="flex items-center gap-2 text-sm font-medium text-violet-700">
                    <HelpCircle className="h-4 w-4" />
                    Configuration du Quiz
                  </FormLabel>
                  <QuizEditor
                    questions={quizQuestions}
                    onChange={setQuizQuestions}
                    passingScore={quizPassingScore}
                    onPassingScoreChange={setQuizPassingScore}
                    disabled={isSubmitting}
                  />
                </div>
              </AnimatedSection>

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 text-gray-400" />
                      Duree estimee (minutes)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="15"
                        className="h-11 w-32 rounded-xl border-gray-200 bg-gray-50 transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                        value={(field.value as number) ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value, 10)
                              : undefined,
                          )
                        }
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Options Section */}
              <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <h3 className="text-sm font-medium text-gray-700">Options</h3>

                <FormField
                  control={form.control}
                  name="isFreePreview"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5 h-5 w-5 rounded-md border-gray-300 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                          <Eye className="h-4 w-4 text-emerald-500" />
                          Apercu gratuit
                        </FormLabel>
                        <FormDescription className="text-xs text-gray-500">
                          Cette lecon sera accessible gratuitement pour tous
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="border-t border-gray-200" />

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-0.5 h-5 w-5 rounded-md border-gray-300 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
                        />
                      </FormControl>
                      <div className="space-y-0.5">
                        <FormLabel className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                          {field.value ? (
                            <Eye className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                          Publier la lecon
                        </FormLabel>
                        <FormDescription className="text-xs text-gray-500">
                          La lecon sera visible par les etudiants inscrits
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="h-11 rounded-xl border-gray-200 px-6 font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            form="lesson-form"
            disabled={isSubmitting}
            className="h-11 rounded-xl bg-emerald-500 px-6 font-medium text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Enregistrement..." : "Creation..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Enregistrer" : "Creer la lecon"}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
