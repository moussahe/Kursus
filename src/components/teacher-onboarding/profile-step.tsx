"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  ExternalLink,
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
import { cn } from "@/lib/utils";
import type { TeacherOnboardingData } from "@/types/teacher-onboarding";
import type { Subject } from "@prisma/client";

interface ProfileStepProps {
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

const EXPERIENCE_OPTIONS = [
  { value: 1, label: "Moins de 2 ans" },
  { value: 3, label: "2-5 ans" },
  { value: 7, label: "5-10 ans" },
  { value: 12, label: "10-15 ans" },
  { value: 20, label: "Plus de 15 ans" },
];

export function ProfileStep({
  data,
  updateData,
  onNext,
  onBack,
}: ProfileStepProps) {
  const [isConnectingStripe, setIsConnectingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const profile = data.profile;

  const updateProfile = (updates: Partial<typeof profile>) => {
    updateData({ profile: { ...profile, ...updates } });
  };

  const toggleSubject = (subject: Subject) => {
    const current = profile.specialties;
    if (current.includes(subject)) {
      updateProfile({ specialties: current.filter((s) => s !== subject) });
    } else if (current.length < 5) {
      updateProfile({ specialties: [...current, subject] });
    }
  };

  const handleStripeConnect = async () => {
    setIsConnectingStripe(true);
    setStripeError(null);

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/teacher-onboarding?stripe=success`,
          refreshUrl: `${window.location.origin}/teacher-onboarding?stripe=refresh`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur Stripe");
      }

      // Redirect to Stripe Connect onboarding
      window.location.href = result.url;
    } catch (error) {
      setStripeError(
        error instanceof Error ? error.message : "Erreur de connexion Stripe",
      );
      setIsConnectingStripe(false);
    }
  };

  const isProfileValid =
    profile.headline.length >= 10 &&
    profile.bio.length >= 50 &&
    profile.specialties.length >= 1 &&
    profile.yearsExperience > 0;

  const canContinue = isProfileValid;

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ff9494]/10"
        >
          <User className="h-6 w-6 text-[#ff9494]" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-900">
          Votre profil professeur
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Presentez-vous aux parents et eleves
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Headline */}
        <div>
          <Label htmlFor="headline" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400" />
            Titre professionnel
          </Label>
          <Input
            id="headline"
            value={profile.headline}
            onChange={(e) => updateProfile({ headline: e.target.value })}
            placeholder="Ex: Professeur de Mathematiques - 10 ans d'experience"
            className="mt-1.5 rounded-xl"
            maxLength={100}
          />
          <p className="mt-1 text-xs text-gray-500">
            {profile.headline.length}/100 caracteres
          </p>
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            Biographie
          </Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => updateProfile({ bio: e.target.value })}
            placeholder="Parlez de votre parcours, votre methode d'enseignement, ce qui vous motive..."
            className="mt-1.5 min-h-[100px] rounded-xl"
            maxLength={500}
          />
          <p className="mt-1 text-xs text-gray-500">
            {profile.bio.length}/500 caracteres (min. 50)
          </p>
        </div>

        {/* Specialties */}
        <div>
          <Label className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            Matieres enseignees
          </Label>
          <p className="mb-2 text-xs text-gray-500">
            Selectionnez jusqu&apos;a 5 matieres
          </p>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => {
              const isSelected = profile.specialties.includes(subject.value);
              return (
                <button
                  key={subject.value}
                  onClick={() => toggleSubject(subject.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                    isSelected
                      ? "bg-[#ff9494] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                >
                  {isSelected && <Check className="mr-1 inline h-3 w-3" />}
                  {subject.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience */}
        <div>
          <Label htmlFor="experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400" />
            Annees d&apos;experience
          </Label>
          <Select
            value={profile.yearsExperience.toString()}
            onValueChange={(v) =>
              updateProfile({ yearsExperience: parseInt(v) })
            }
          >
            <SelectTrigger className="mt-1.5 rounded-xl">
              <SelectValue placeholder="Selectionnez..." />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stripe Connect */}
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <CreditCard className="h-5 w-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                Configuration des paiements
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Connectez votre compte Stripe pour recevoir vos paiements
                directement.
              </p>

              {data.stripeConnected ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#ff9494]/10 px-3 py-2">
                  <Check className="h-4 w-4 text-[#ff9494]" />
                  <span className="text-sm font-medium text-[#ff9494]">
                    Stripe connecte
                  </span>
                </div>
              ) : (
                <div className="mt-3">
                  <Button
                    onClick={handleStripeConnect}
                    disabled={isConnectingStripe}
                    variant="outline"
                    className="rounded-xl border-violet-200 bg-white hover:bg-violet-100"
                  >
                    {isConnectingStripe ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connecter Stripe
                      </>
                    )}
                  </Button>
                  {stripeError && (
                    <p className="mt-2 text-sm text-red-600">{stripeError}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Vous pourrez configurer Stripe plus tard si vous preferez.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile completeness */}
      <div className="rounded-xl bg-gray-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Profil complete a</span>
          <span className="font-semibold text-[#ff9494]">
            {Math.round(
              (profile.headline.length >= 10 ? 25 : 0) +
                (profile.bio.length >= 50 ? 25 : 0) +
                (profile.specialties.length >= 1 ? 25 : 0) +
                (profile.yearsExperience > 0 ? 25 : 0),
            )}
            %
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full bg-[#ff9494]"
            initial={{ width: 0 }}
            animate={{
              width: `${
                (profile.headline.length >= 10 ? 25 : 0) +
                (profile.bio.length >= 50 ? 25 : 0) +
                (profile.specialties.length >= 1 ? 25 : 0) +
                (profile.yearsExperience > 0 ? 25 : 0)
              }%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
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
          className="flex-1 rounded-xl bg-[#ff9494] hover:bg-[#6966ff]"
        >
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {!canContinue && (
        <p className="text-center text-xs text-gray-500">
          Completez tous les champs obligatoires pour continuer
        </p>
      )}
    </div>
  );
}
