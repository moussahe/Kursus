"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GraduationCap,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Subject enum values with French labels
const SUBJECTS = [
  { value: "MATHEMATIQUES", label: "Mathematiques" },
  { value: "FRANCAIS", label: "Francais" },
  { value: "HISTOIRE_GEO", label: "Histoire-Geographie" },
  { value: "SCIENCES", label: "Sciences" },
  { value: "ANGLAIS", label: "Anglais" },
  { value: "PHYSIQUE_CHIMIE", label: "Physique-Chimie" },
  { value: "SVT", label: "SVT" },
  { value: "PHILOSOPHIE", label: "Philosophie" },
  { value: "ESPAGNOL", label: "Espagnol" },
  { value: "ALLEMAND", label: "Allemand" },
  { value: "SES", label: "SES" },
  { value: "NSI", label: "NSI" },
] as const;

type SubjectValue = (typeof SUBJECTS)[number]["value"];

// Step 1 schema: Basic info
const step1Schema = z.object({
  name: z.string().min(2, "Minimum 2 caracteres"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caracteres")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[a-z]/, "Au moins une minuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
});

// Step 2 schema: Teacher profile
const step2Schema = z.object({
  headline: z
    .string()
    .min(10, "Minimum 10 caracteres")
    .max(100, "Maximum 100 caracteres"),
  bio: z
    .string()
    .min(50, "Minimum 50 caracteres")
    .max(1000, "Maximum 1000 caracteres"),
  specialties: z.array(z.string()).min(1, "Selectionnez au moins une matiere"),
  yearsExperience: z
    .number({ message: "Entrez un nombre valide" })
    .min(0, "L'experience ne peut pas etre negative")
    .max(50, "Maximum 50 ans d'experience"),
});

// Combined schema
const teacherRegisterSchema = step1Schema.merge(step2Schema);

type TeacherFormData = z.infer<typeof teacherRegisterSchema>;

const STEPS = [
  { id: 1, name: "Informations", icon: User },
  { id: 2, name: "Profil enseignant", icon: Briefcase },
  { id: 3, name: "Confirmation", icon: CheckCircle },
];

export default function TeacherRegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<
    SubjectValue[]
  >([]);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TeacherFormData>({
    resolver: zodResolver(teacherRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      headline: "",
      bio: "",
      specialties: [],
      yearsExperience: 0,
    },
    mode: "onChange",
  });

  const formValues = watch();

  const handleSpecialtyToggle = useCallback(
    (subject: SubjectValue) => {
      setSelectedSpecialties((prev) => {
        const newSpecialties = prev.includes(subject)
          ? prev.filter((s) => s !== subject)
          : [...prev, subject];
        setValue("specialties", newSpecialties, { shouldValidate: true });
        return newSpecialties;
      });
    },
    [setValue],
  );

  const nextStep = async () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = await trigger(["name", "email", "password"]);
    } else if (currentStep === 2) {
      isValid = await trigger([
        "headline",
        "bio",
        "specialties",
        "yearsExperience",
      ]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || "Une erreur est survenue");
        return;
      }

      router.push("/teacher");
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const progressValue = (currentStep / 3) * 100;

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Kursus</span>
            </Link>
            <h2 className="mt-8 text-2xl font-bold text-gray-900">
              Devenir enseignant
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Partagez votre savoir et generez des revenus
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : isCurrent
                              ? "border-emerald-600 bg-emerald-50 text-emerald-600"
                              : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className={`mt-2 text-xs font-medium ${
                          isCurrent || isCompleted
                            ? "text-emerald-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 flex-1 ${
                          isCompleted ? "bg-emerald-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <Progress value={progressValue} className="mt-4 h-1 bg-gray-200" />
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    className="h-11"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="h-11"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    className="h-11"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    8 caracteres minimum avec majuscule, minuscule et chiffre
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Teacher Profile */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="headline">Titre professionnel</Label>
                  <Input
                    id="headline"
                    type="text"
                    placeholder="Professeur de Mathematiques - 10 ans d'experience"
                    className="h-11"
                    {...register("headline")}
                  />
                  {errors.headline && (
                    <p className="text-sm text-red-600">
                      {errors.headline.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Ce titre apparaitra sur votre profil public
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    placeholder="Decrivez votre parcours, vos methodes pedagogiques et ce qui vous motive..."
                    className="min-h-[120px]"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-600">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-gray-500">Minimum 50 caracteres</p>
                </div>

                <div className="space-y-3">
                  <Label>Matieres enseignees</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SUBJECTS.map((subject) => {
                      const isSelected = selectedSpecialties.includes(
                        subject.value,
                      );
                      return (
                        <div
                          key={subject.value}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleSpecialtyToggle(subject.value)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleSpecialtyToggle(subject.value)
                            }
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                          <span
                            className={`text-sm ${
                              isSelected
                                ? "font-medium text-emerald-700"
                                : "text-gray-600"
                            }`}
                          >
                            {subject.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {errors.specialties && (
                    <p className="text-sm text-red-600">
                      {errors.specialties.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">
                    Annees d&apos;experience
                  </Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="5"
                    className="h-11 w-32"
                    {...register("yearsExperience", { valueAsNumber: true })}
                  />
                  {errors.yearsExperience && (
                    <p className="text-sm text-red-600">
                      {errors.yearsExperience.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-800">
                    <CheckCircle className="h-5 w-5" />
                    Recapitulatif de votre inscription
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Nom complet
                      </p>
                      <p className="text-gray-900">{formValues.name}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900">{formValues.email}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Titre professionnel
                      </p>
                      <p className="text-gray-900">{formValues.headline}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Biographie
                      </p>
                      <p className="text-sm text-gray-900">{formValues.bio}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Matieres
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedSpecialties.map((specialty) => {
                          const subject = SUBJECTS.find(
                            (s) => s.value === specialty,
                          );
                          return (
                            <Badge
                              key={specialty}
                              className="bg-emerald-600 text-white"
                            >
                              {subject?.label || specialty}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Experience
                      </p>
                      <p className="text-gray-900">
                        {formValues.yearsExperience} an
                        {formValues.yearsExperience > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    En cliquant sur &quot;Creer mon compte&quot;, vous acceptez
                    nos{" "}
                    <Link
                      href={"/conditions" as Route}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      conditions d&apos;utilisation
                    </Link>{" "}
                    et notre{" "}
                    <Link
                      href={"/confidentialite" as Route}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      politique de confidentialite
                    </Link>
                    .
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-11 flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creation en cours...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Creer mon compte
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Se connecter
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">
            Vous etes parent ?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-600 hover:text-emerald-500"
            >
              Inscription parent
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Image/Gradient */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        </div>
        <div className="relative flex h-full items-center justify-center p-12">
          <div className="max-w-md text-white">
            <h3 className="text-3xl font-bold">Partagez votre savoir</h3>
            <p className="mt-4 text-lg text-emerald-100">
              Creez des cours de qualité et generez des revenus complementaires.
              Gardez 70% de chaque vente.
            </p>
            <ul className="mt-8 space-y-4 text-emerald-100">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/30">
                  <Check className="h-4 w-4 text-white" />
                </div>
                Creez des cours en toute liberte
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/30">
                  <Check className="h-4 w-4 text-white" />
                </div>
                Touchez des milliers d&apos;élèves
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/30">
                  <Check className="h-4 w-4 text-white" />
                </div>
                Generez des revenus passifs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
