"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const courseFormSchema = z.object({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caracteres"),
  subtitle: z.string().optional(),
  description: z
    .string()
    .min(20, "La description doit contenir au moins 20 caracteres"),
  subject: z.enum([
    "MATHEMATIQUES",
    "FRANCAIS",
    "HISTOIRE_GEO",
    "SCIENCES",
    "ANGLAIS",
    "PHYSIQUE_CHIMIE",
    "SVT",
    "PHILOSOPHIE",
    "ESPAGNOL",
    "ALLEMAND",
    "SES",
    "NSI",
  ]),
  gradeLevel: z.enum([
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "SIXIEME",
    "CINQUIEME",
    "QUATRIEME",
    "TROISIEME",
    "SECONDE",
    "PREMIERE",
    "TERMINALE",
  ]),
  price: z.coerce.number().min(0, "Le prix doit etre positif"),
  imageUrl: z.string().optional(),
  learningOutcomes: z.array(
    z.object({
      value: z.string().min(1, "Ce champ est requis"),
    }),
  ),
  requirements: z.array(
    z.object({
      value: z.string(),
    }),
  ),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

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

interface CourseEditFormProps {
  course: CourseFormValues & { id: string };
}

export function CourseEditForm({ course }: CourseEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course,
  });

  const {
    fields: learningOutcomesFields,
    append: appendLearningOutcome,
    remove: removeLearningOutcome,
  } = useFieldArray({
    control: form.control,
    name: "learningOutcomes",
  });

  const {
    fields: requirementsFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control: form.control,
    name: "requirements",
  });

  const onSubmit = async (values: unknown) => {
    const data = values as CourseFormValues;
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        price: Math.round(data.price * 100),
        learningOutcomes: data.learningOutcomes
          .map((o) => o.value)
          .filter(Boolean),
        requirements: data.requirements.map((r) => r.value).filter(Boolean),
      };

      const response = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      toast.success("Cours mis a jour avec succes");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du cours *</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sous-titre</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-32 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matiere *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.value} value={subject.value}>
                            {subject.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix (EUR) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="rounded-xl"
                      value={field.value as number}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormDescription>
                    Entrez 0 pour un cours gratuit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de l&apos;image</FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Objectifs d&apos;apprentissage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {learningOutcomesFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`learningOutcomes.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder={`Objectif ${index + 1}`}
                          className="rounded-xl"
                          {...field}
                        />
                        {learningOutcomesFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLearningOutcome(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => appendLearningOutcome({ value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un objectif
            </Button>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Prerequis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requirementsFields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`requirements.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder={`Prerequis ${index + 1}`}
                          className="rounded-xl"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRequirement(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => appendRequirement({ value: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un prerequis
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
