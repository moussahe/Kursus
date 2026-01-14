"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { OnboardingStep1 } from "@/components/onboarding/step-1-child";
import { OnboardingStep2 } from "@/components/onboarding/step-2-subjects";
import { OnboardingStep3 } from "@/components/onboarding/step-3-goals";
import { OnboardingStep4 } from "@/components/onboarding/step-4-recommendations";
import { OnboardingProgress } from "@/components/onboarding/progress-bar";
import type { OnboardingData, GradeLevel } from "@/types/onboarding";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    child: {
      firstName: "",
      gradeLevel: "" as GradeLevel,
    },
    subjects: [],
    goals: [],
    weeklyTime: 5,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const updateData = (updates: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Create child
      const childResponse = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: onboardingData.child.firstName,
          gradeLevel: onboardingData.child.gradeLevel,
        }),
      });

      if (!childResponse.ok) {
        throw new Error("Failed to create child");
      }

      const child = await childResponse.json();

      // Save onboarding preferences
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId: child.id,
          subjects: onboardingData.subjects,
          goals: onboardingData.goals,
          weeklyTime: onboardingData.weeklyTime,
        }),
      });

      // Redirect to dashboard with success message
      router.push("/parent?onboarding=complete");
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Bienvenue sur Schoolaris, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-2 text-gray-600">
            Personnalisons votre experience en quelques etapes
          </p>
        </div>

        {/* Progress Bar */}
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />

        {/* Step Content */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-lg">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              custom={currentStep}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.3 }}
            >
              {currentStep === 1 && (
                <OnboardingStep1
                  data={onboardingData}
                  updateData={updateData}
                  onNext={handleNext}
                />
              )}
              {currentStep === 2 && (
                <OnboardingStep2
                  data={onboardingData}
                  updateData={updateData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 3 && (
                <OnboardingStep3
                  data={onboardingData}
                  updateData={updateData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
              {currentStep === 4 && (
                <OnboardingStep4
                  data={onboardingData}
                  onComplete={handleComplete}
                  onBack={handleBack}
                  isLoading={isLoading}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Skip Option */}
        {currentStep < TOTAL_STEPS && (
          <p className="mt-6 text-center text-sm text-gray-500">
            <button
              onClick={() => router.push("/parent")}
              className="text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Passer cette etape
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
