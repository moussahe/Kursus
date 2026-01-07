"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const lessonSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caracteres"),
  description: z.string().optional(),
  contentType: z.enum(["VIDEO", "TEXT", "QUIZ", "DOCUMENT", "EXERCISE"]),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  duration: z.coerce.number().min(0).optional(),
  isPublished: z.boolean().default(false),
  isFreePreview: z.boolean().default(false),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

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
  },
  {
    value: "TEXT",
    label: "Texte",
    icon: FileText,
    description: "Contenu textuel",
  },
  {
    value: "QUIZ",
    label: "Quiz",
    icon: HelpCircle,
    description: "Questions interactives",
  },
  {
    value: "DOCUMENT",
    label: "Document",
    icon: FileIcon,
    description: "PDF, documents",
  },
  {
    value: "EXERCISE",
    label: "Exercice",
    icon: HelpCircle,
    description: "Exercices pratiques",
  },
];

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
    },
  });

  const contentType = form.watch("contentType");

  const onSubmit = async (values: z.infer<typeof lessonSchema>) => {
    setIsSubmitting(true);

    try {
      const url = isEditing
        ? `/api/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`
        : `/api/courses/${courseId}/chapters/${chapterId}/lessons`;

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      const savedLesson = await response.json();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la lecon" : "Ajouter une lecon"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les details de votre lecon"
              : "Remplissez les informations pour creer une nouvelle lecon"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la lecon *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Introduction aux nombres decimaux"
                      className="rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description de la lecon..."
                      className="rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Type */}
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de contenu *</FormLabel>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {contentTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = field.value === type.value;

                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => field.onChange(type.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                            isSelected
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-6 w-6",
                              isSelected ? "text-emerald-500" : "text-gray-400",
                            )}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isSelected ? "text-emerald-700" : "text-gray-600",
                            )}
                          >
                            {type.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video URL (shown for VIDEO type) */}
            {contentType === "VIDEO" && (
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la video</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Lien YouTube, Vimeo ou autre plateforme video
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Content (shown for TEXT type) */}
            {contentType === "TEXT" && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ecrivez le contenu de votre lecon..."
                        className="min-h-40 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duree (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="15"
                      className="rounded-xl"
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
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Options */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isFreePreview"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer">
                        Apercu gratuit
                      </FormLabel>
                      <FormDescription>
                        Cette lecon sera accessible gratuitement pour tous
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="cursor-pointer">
                        Publier la lecon
                      </FormLabel>
                      <FormDescription>
                        La lecon sera visible par les etudiants inscrits
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
