"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  CheckCircle,
  TrendingUp,
  Zap,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const KURSUS = {
  orange: "#ff6d38",
  purple: "#7a78ff",
};

// Subject enum values with French labels
const SUBJECTS = [
  { value: "MATHEMATIQUES", label: "Mathématiques" },
  { value: "FRANCAIS", label: "Français" },
  { value: "HISTOIRE_GEO", label: "Histoire-Géographie" },
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
  name: z.string().min(2, "Minimum 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[a-z]/, "Au moins une minuscule")
    .regex(/[0-9]/, "Au moins un chiffre"),
});

// Step 2 schema: Teacher profile
const step2Schema = z.object({
  headline: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(100, "Maximum 100 caractères"),
  bio: z
    .string()
    .min(50, "Minimum 50 caractères")
    .max(1000, "Maximum 1000 caractères"),
  specialties: z.array(z.string()).min(1, "Sélectionnez au moins une matière"),
  yearsExperience: z
    .number({ message: "Entrez un nombre valide" })
    .min(0, "L'expérience ne peut pas être négative")
    .max(50, "Maximum 50 ans d'expérience"),
});

// Combined schema
const teacherRegisterSchema = step1Schema.merge(step2Schema);

type TeacherFormData = z.infer<typeof teacherRegisterSchema>;

const STEPS = [
  { id: 1, name: "Informations", icon: User },
  { id: 2, name: "Profil enseignant", icon: Briefcase },
  { id: 3, name: "Confirmation", icon: CheckCircle },
];

// Password requirements for visual feedback
const PASSWORD_REQUIREMENTS = [
  { regex: /.{8,}/, label: "8 caractères minimum" },
  { regex: /[A-Z]/, label: "Une majuscule" },
  { regex: /[a-z]/, label: "Une minuscule" },
  { regex: /[0-9]/, label: "Un chiffre" },
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
  const passwordValue = watch("password", "");

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
    <div className="flex min-h-screen bg-[var(--kursus-bg)]">
      {/* Left side - Branding */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        {/* Background gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #0a0a0a 0%, #141414 100%)`,
          }}
        />

        {/* Decorative elements */}
        <div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[120px]"
          style={{ background: `${KURSUS.purple}20` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[100px]"
          style={{ background: `${KURSUS.orange}15` }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md text-center"
          >
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${KURSUS.purple}, #6366f1)`,
                  boxShadow: `0 0 40px -10px ${KURSUS.purple}`,
                }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-4xl font-black tracking-tight text-white">
              Partagez votre{" "}
              <span style={{ color: KURSUS.purple }}>savoir</span>
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Créez des cours de qualité et générez des revenus complémentaires.
            </p>

            {/* Features */}
            <div className="mt-12 space-y-4 text-left">
              {[
                {
                  icon: TrendingUp,
                  text: "Gardez 70% de chaque vente",
                  color: KURSUS.purple,
                },
                {
                  icon: Zap,
                  text: "Outils de création intuitifs avec IA",
                  color: KURSUS.orange,
                },
                {
                  icon: Shield,
                  text: "Support dédié aux enseignants",
                  color: KURSUS.purple,
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ background: `${feature.color}20` }}
                  >
                    <feature.icon
                      className="h-5 w-5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <span className="text-sm text-gray-300">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                { value: "350€", label: "/mois moyen" },
                { value: "300+", label: "Profs actifs" },
                { value: "70%", label: "Commission" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-black"
                    style={{ color: KURSUS.purple }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-lg"
        >
          {/* Logo mobile */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: KURSUS.orange }}
              >
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--kursus-text)]">
                Kursus
              </span>
            </Link>
            <h1 className="mt-8 text-2xl font-bold text-[var(--kursus-text)]">
              Devenir enseignant
            </h1>
            <p className="mt-2 text-sm text-[var(--kursus-text-muted)]">
              Partagez votre savoir et générez des revenus
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
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all"
                        style={{
                          borderColor:
                            isCompleted || isCurrent
                              ? KURSUS.purple
                              : "var(--kursus-border)",
                          background: isCompleted
                            ? KURSUS.purple
                            : isCurrent
                              ? "var(--kursus-purple-bg)"
                              : "transparent",
                          color: isCompleted
                            ? "#0a0a0a"
                            : isCurrent
                              ? "var(--kursus-purple-text)"
                              : "var(--kursus-text-muted)",
                        }}
                      >
                        {isCompleted ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <span
                        className="mt-2 text-xs font-medium"
                        style={{
                          color:
                            isCurrent || isCompleted
                              ? "var(--kursus-purple-text)"
                              : "var(--kursus-text-muted)",
                        }}
                      >
                        {step.name}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className="mx-2 h-0.5 flex-1"
                        style={{
                          background: isCompleted
                            ? KURSUS.purple
                            : "var(--kursus-border)",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-[var(--kursus-border)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: KURSUS.purple }}
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Nom complet
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jean Dupont"
                    className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Mot de passe
                  </Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                  {/* Password requirements */}
                  <div className="mt-2 space-y-1">
                    {PASSWORD_REQUIREMENTS.map((req, index) => {
                      const isValid = req.regex.test(passwordValue);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                          style={{
                            color: isValid
                              ? "var(--kursus-purple-text)"
                              : "var(--kursus-text-muted)",
                          }}
                        >
                          {isValid ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          <span>{req.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Teacher Profile */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="headline"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Titre professionnel
                  </Label>
                  <Input
                    id="headline"
                    type="text"
                    placeholder="Professeur de Mathématiques - 10 ans d'expérience"
                    className="h-12 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("headline")}
                  />
                  {errors.headline && (
                    <p className="text-sm text-red-500">
                      {errors.headline.message}
                    </p>
                  )}
                  <p className="text-xs text-[var(--kursus-text-muted)]">
                    Ce titre apparaîtra sur votre profil public
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="bio"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Biographie
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Décrivez votre parcours, vos méthodes pédagogiques et ce qui vous motive..."
                    className="min-h-[120px] rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("bio")}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                  <p className="text-xs text-[var(--kursus-text-muted)]">
                    Minimum 50 caractères
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-[var(--kursus-text-muted)]">
                    Matières enseignées
                  </Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {SUBJECTS.map((subject) => {
                      const isSelected = selectedSpecialties.includes(
                        subject.value,
                      );
                      return (
                        <div
                          key={subject.value}
                          className="flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 transition-all"
                          style={{
                            borderColor: isSelected
                              ? KURSUS.purple
                              : "var(--kursus-border)",
                            background: isSelected
                              ? "var(--kursus-purple-bg)"
                              : "transparent",
                          }}
                          onClick={() => handleSpecialtyToggle(subject.value)}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleSpecialtyToggle(subject.value)
                            }
                            style={{
                              borderColor: isSelected
                                ? KURSUS.purple
                                : "var(--kursus-border)",
                              background: isSelected
                                ? KURSUS.purple
                                : "transparent",
                            }}
                          />
                          <span
                            className="text-sm"
                            style={{
                              color: isSelected
                                ? "var(--kursus-purple-text)"
                                : "var(--kursus-text-muted)",
                              fontWeight: isSelected ? 500 : 400,
                            }}
                          >
                            {subject.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {errors.specialties && (
                    <p className="text-sm text-red-500">
                      {errors.specialties.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="yearsExperience"
                    className="text-[var(--kursus-text-muted)]"
                  >
                    Années d&apos;expérience
                  </Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="5"
                    className="h-12 w-32 rounded-xl border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] text-[var(--kursus-text)] placeholder:text-[var(--kursus-text-muted)]"
                    {...register("yearsExperience", { valueAsNumber: true })}
                  />
                  {errors.yearsExperience && (
                    <p className="text-sm text-red-500">
                      {errors.yearsExperience.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: "var(--kursus-purple-bg)",
                    border: "1px solid var(--kursus-purple-border)",
                  }}
                >
                  <h3
                    className="flex items-center gap-2 text-lg font-semibold"
                    style={{ color: "var(--kursus-purple-text)" }}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Récapitulatif de votre inscription
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--kursus-text-muted)]">
                        Nom complet
                      </p>
                      <p className="text-[var(--kursus-text)]">
                        {formValues.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[var(--kursus-text-muted)]">
                        Email
                      </p>
                      <p className="text-[var(--kursus-text)]">
                        {formValues.email}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[var(--kursus-text-muted)]">
                        Titre professionnel
                      </p>
                      <p className="text-[var(--kursus-text)]">
                        {formValues.headline}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[var(--kursus-text-muted)]">
                        Biographie
                      </p>
                      <p className="text-sm text-[var(--kursus-text)]">
                        {formValues.bio}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[var(--kursus-text-muted)]">
                        Matières
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedSpecialties.map((specialty) => {
                          const subject = SUBJECTS.find(
                            (s) => s.value === specialty,
                          );
                          return (
                            <Badge
                              key={specialty}
                              style={{
                                background: KURSUS.purple,
                                color: "#0a0a0a",
                              }}
                            >
                              {subject?.label || specialty}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-[var(--kursus-text-muted)]">
                        Expérience
                      </p>
                      <p className="text-[var(--kursus-text)]">
                        {formValues.yearsExperience} an
                        {formValues.yearsExperience > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] p-4">
                  <p className="text-sm text-[var(--kursus-text-muted)]">
                    En cliquant sur &quot;Créer mon compte&quot;, vous acceptez
                    nos{" "}
                    <Link
                      href={"/conditions" as Route}
                      className="font-medium transition-colors hover:opacity-80"
                      style={{ color: KURSUS.orange }}
                    >
                      conditions d&apos;utilisation
                    </Link>{" "}
                    et notre{" "}
                    <Link
                      href={"/confidentialite" as Route}
                      className="font-medium transition-colors hover:opacity-80"
                      style={{ color: KURSUS.orange }}
                    >
                      politique de confidentialité
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
                  className="h-12 flex-1 rounded-xl border-[var(--kursus-border)] bg-transparent text-[var(--kursus-text)] hover:bg-[var(--kursus-bg-elevated)]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 flex-1 rounded-xl text-base font-semibold transition-all hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${KURSUS.purple}, #6366f1)`,
                    color: "#0a0a0a",
                  }}
                >
                  Continuer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 flex-1 rounded-xl text-base font-semibold transition-all hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${KURSUS.purple}, #6366f1)`,
                    color: "#0a0a0a",
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Créer mon compte
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--kursus-text-muted)]">
            Déjà un compte ?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: KURSUS.orange }}
            >
              Se connecter
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-[var(--kursus-text-muted)]">
            Vous êtes parent ?{" "}
            <Link
              href="/register"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: KURSUS.orange }}
            >
              Inscription parent
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
