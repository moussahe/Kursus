"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Plus,
  X,
  BookOpen,
  Eye,
  Loader2,
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Schemas
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
  learningOutcomes: z
    .array(
      z.object({
        value: z.string().min(1, "Ce champ est requis"),
      }),
    )
    .min(1, "Ajoutez au moins un objectif"),
  requirements: z.array(
    z.object({
      value: z.string().min(1, "Ce champ est requis"),
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

const steps = [
  { id: 1, name: "Informations", description: "Details du cours" },
  { id: 2, name: "Image", description: "Image de couverture" },
  { id: 3, name: "Contenu", description: "Objectifs et prerequis" },
];

interface CourseEditorProps {
  initialData?: CourseFormValues & { id?: string };
}

export function CourseEditor({ initialData }: CourseEditorProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const form = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: initialData ?? {
      title: "",
      subtitle: "",
      description: "",
      subject: "MATHEMATIQUES" as const,
      gradeLevel: "SIXIEME" as const,
      price: 0,
      imageUrl: "",
      learningOutcomes: [{ value: "" }],
      requirements: [{ value: "" }],
    },
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

  const handleNext = useCallback(async () => {
    let fieldsToValidate: (keyof CourseFormValues)[] = [];

    if (currentStep === 1) {
      fieldsToValidate = [
        "title",
        "description",
        "subject",
        "gradeLevel",
        "price",
      ];
    } else if (currentStep === 2) {
      // Image is optional, just proceed
    } else if (currentStep === 3) {
      fieldsToValidate = ["learningOutcomes", "requirements"];
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, form]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const onSubmit = async (values: unknown) => {
    const data = values as CourseFormValues;
    setIsSubmitting(true);

    try {
      const payload = {
        ...data,
        price: Math.round(data.price * 100), // Convert to cents
        learningOutcomes: data.learningOutcomes
          .map((o) => o.value)
          .filter(Boolean),
        requirements: data.requirements.map((r) => r.value).filter(Boolean),
      };

      const url = initialData?.id
        ? `/api/courses/${initialData.id}`
        : "/api/courses";
      const method = initialData?.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      const course = await response.json();

      toast.success(
        initialData?.id
          ? "Cours mis a jour avec succes"
          : "Cours cree avec succes",
      );

      router.push(`/teacher/courses/${course.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedValues = form.watch();

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "relative flex flex-1 items-center",
                index !== steps.length - 1 && "pr-8",
              )}
            >
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-0 top-4 h-0.5 w-full",
                    step.id < currentStep ? "bg-emerald-500" : "bg-gray-200",
                  )}
                  style={{ left: "50%" }}
                />
              )}
              <div className="relative flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                    step.id < currentStep
                      ? "bg-emerald-500 text-white"
                      : step.id === currentStep
                        ? "border-2 border-emerald-500 bg-white text-emerald-500"
                        : "border-2 border-gray-200 bg-white text-gray-400",
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium",
                    step.id <= currentStep
                      ? "text-emerald-600"
                      : "text-gray-500",
                  )}
                >
                  {step.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <Card className="rounded-2xl border-0 bg-white shadow-sm">
              <CardContent className="space-y-6 p-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du cours *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Mathematiques 6eme - Les fractions"
                          className="rounded-xl"
                          {...field}
                        />
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
                        <Input
                          placeholder="Ex: Maitriser les fractions en 10 lecons"
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Court resume affiche sur les cartes de cours
                      </FormDescription>
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
                        <Textarea
                          placeholder="Decrivez votre cours en detail..."
                          className="min-h-32 rounded-xl"
                          {...field}
                        />
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Selectionnez une matiere" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem
                                key={subject.value}
                                value={subject.value}
                              >
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Selectionnez un niveau" />
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
                        <div className="relative">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="29.99"
                            className="rounded-xl pl-8"
                            value={field.value as number}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            EUR
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Entrez 0 pour un cours gratuit
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Image */}
          {currentStep === 2 && (
            <Card className="rounded-2xl border-0 bg-white shadow-sm">
              <CardContent className="space-y-6 p-6">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image de couverture</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                              <img
                                src={field.value}
                                alt="Course preview"
                                className="h-full w-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 rounded-xl"
                                onClick={() => field.onChange("")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                              <Upload className="mb-2 h-8 w-8 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                Glissez une image ou cliquez pour telecharger
                              </p>
                              <p className="text-xs text-gray-400">
                                PNG, JPG jusqu&apos;a 5MB
                              </p>
                            </div>
                          )}
                          <Input
                            placeholder="Ou entrez l'URL de l'image"
                            className="rounded-xl"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        L&apos;image sera affichee dans le catalogue et sur la
                        page du cours
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Learning Outcomes & Requirements */}
          {currentStep === 3 && (
            <Card className="rounded-2xl border-0 bg-white shadow-sm">
              <CardContent className="space-y-8 p-6">
                {/* Learning Outcomes */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">
                      Ce que les eleves vont apprendre *
                    </Label>
                    <p className="text-sm text-gray-500">
                      Listez les competences que les eleves acquerront
                    </p>
                  </div>

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
                                  className="shrink-0"
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
                </div>

                {/* Requirements */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Prerequis</Label>
                    <p className="text-sm text-gray-500">
                      Ce que les eleves doivent savoir avant de commencer
                    </p>
                  </div>

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
                                className="shrink-0"
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Panel */}
          {showPreview && (
            <Card className="rounded-2xl border-0 bg-white shadow-sm">
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold">Apercu du cours</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {watchedValues.imageUrl ? (
                      <img
                        src={watchedValues.imageUrl}
                        alt="Preview"
                        className="h-32 w-48 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-32 w-48 items-center justify-center rounded-xl bg-gray-100">
                        <BookOpen className="h-8 w-8 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold">
                        {watchedValues.title || "Titre du cours"}
                      </h4>
                      <p className="text-gray-500">
                        {watchedValues.subtitle || "Sous-titre du cours"}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Badge className="bg-emerald-100 text-emerald-700">
                          {subjects.find(
                            (s) => s.value === watchedValues.subject,
                          )?.label ?? watchedValues.subject}
                        </Badge>
                        <Badge variant="secondary">
                          {gradeLevels.find(
                            (l) => l.value === watchedValues.gradeLevel,
                          )?.label ?? watchedValues.gradeLevel}
                        </Badge>
                      </div>
                      <p className="mt-2 text-lg font-bold text-emerald-600">
                        {watchedValues.price
                          ? `${Number(watchedValues.price).toFixed(2)} EUR`
                          : "Gratuit"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium">Description</h5>
                    <p className="text-sm text-gray-600">
                      {watchedValues.description || "Aucune description"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="rounded-xl"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="rounded-xl"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Masquer apercu" : "Apercu"}
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  Suivant
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creation...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {initialData?.id ? "Mettre a jour" : "Creer le cours"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
