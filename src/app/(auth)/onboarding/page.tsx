"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Clock, Users, PartyPopper } from "lucide-react";
import { OnboardingStep1 } from "@/components/onboarding/step-1-child";
import { OnboardingStep2 } from "@/components/onboarding/step-2-subjects";
import { OnboardingStep3 } from "@/components/onboarding/step-3-goals";
import { OnboardingStep4 } from "@/components/onboarding/step-4-recommendations";
import { OnboardingProgress } from "@/components/onboarding/progress-bar";
import type { OnboardingData, GradeLevel } from "@/types/onboarding";

const TOTAL_STEPS = 4;

// Social proof for each step
const STEP_SOCIAL_PROOF = [
  { stat: "92%", text: "des parents completent cette etape" },
  { stat: "88%", text: "des parents personnalisent les matieres" },
  { stat: "85%", text: "des parents fixent des objectifs" },
  { stat: "100%", text: "recevront des recommandations personnalisees" },
];

// Step completion messages
const STEP_CELEBRATION = [
  "Super ! Vous avez ajoute votre enfant.",
  "Parfait ! Matieres selectionnees.",
  "Excellent ! Objectifs definis.",
  "Felicitations ! Onboarding termine.",
];

// Pre-computed confetti particles to avoid impure Math.random in render
const CONFETTI_PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  left: (i * 3.33) % 100, // Distribute evenly 0-100
  color: ["#E8A336", "#10B981", "#6366F1", "#EC4899"][i % 4],
  rotate: (i * 24 - 360) % 720, // -360 to 360
  xOffset: (i * 13.33 - 200) % 200, // -100 to 100
  duration: 2.5 + (i % 10) * 0.15, // 2.5 to 4.0
  delay: (i % 10) * 0.03, // 0 to 0.3
}));

// Confetti component for celebration
function Confetti({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {CONFETTI_PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute h-3 w-3 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: `${particle.left}%`,
            top: -20,
          }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{
            y: 1000,
            opacity: 0,
            scale: [1, 0.8, 0.5],
            rotate: particle.rotate,
            x: particle.xOffset,
          }}
          transition={{
            duration: particle.duration,
            ease: "easeOut",
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}

// Step transition celebration message
function CelebrationMessage({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed left-1/2 top-32 z-50 -translate-x-1/2"
    >
      <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-white shadow-lg">
        <PartyPopper className="h-5 w-5" />
        <span className="font-medium">{message}</span>
      </div>
    </motion.div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
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

  // Celebrate step completion
  const celebrate = useCallback((stepIndex: number) => {
    setCelebrationMessage(STEP_CELEBRATION[stepIndex]);
    setShowCelebration(true);
    setShowConfetti(true);

    // Hide celebration after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  }, []);

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
      celebrate(currentStep - 1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveForLater = async () => {
    // Save current progress locally
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "onboarding_progress",
        JSON.stringify({
          step: currentStep,
          data: onboardingData,
          timestamp: Date.now(),
        }),
      );
    }
    router.push("/parent?onboarding=later");
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

      // Final celebration
      celebrate(3);

      // Wait for celebration, then redirect
      setTimeout(() => {
        router.push("/parent?onboarding=complete");
      }, 2500);
    } catch (error) {
      console.error("Onboarding error:", error);
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

  const currentSocialProof = STEP_SOCIAL_PROOF[currentStep - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* Confetti Animation */}
      <Confetti active={showConfetti} />

      {/* Celebration Message */}
      <AnimatePresence>
        <CelebrationMessage
          message={celebrationMessage}
          visible={showCelebration}
        />
      </AnimatePresence>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Personnalisation en cours
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Bienvenue sur Kursus, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-2 text-gray-600">
            Personnalisons votre experience en quelques etapes
          </p>

          {/* Time estimate */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>2 min</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>15,000+ parents nous font confiance</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />

        {/* Social Proof for current step */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-emerald-600">
              {currentSocialProof.stat}
            </span>{" "}
            {currentSocialProof.text}
          </p>
        </motion.div>

        {/* Step Content */}
        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-lg">
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

        {/* Save for Later (instead of Skip) */}
        {currentStep < TOTAL_STEPS && (
          <div className="mt-6 text-center">
            <button
              onClick={handleSaveForLater}
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Je ferai ca plus tard
            </button>
            <p className="mt-1 text-xs text-gray-400">
              Votre progression sera sauvegardee
            </p>
          </div>
        )}

        {/* Motivation Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center"
        >
          <p className="text-sm text-emerald-800">
            <strong>Astuce :</strong> Les parents qui completent
            l&apos;onboarding voient leurs enfants progresser{" "}
            <span className="font-bold">2x plus vite</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
