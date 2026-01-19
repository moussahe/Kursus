"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, GraduationCap } from "lucide-react";
import { WelcomeStep } from "@/components/teacher-onboarding/welcome-step";
import { ProfileStep } from "@/components/teacher-onboarding/profile-step";
import { CourseAIStep } from "@/components/teacher-onboarding/course-ai-step";
import {
  PreviewStep,
  CompleteStep,
} from "@/components/teacher-onboarding/preview-step";
import { TeacherOnboardingProgress } from "@/components/teacher-onboarding/progress-bar";
import type {
  TeacherOnboardingData,
  TeacherOnboardingStep,
} from "@/types/teacher-onboarding";
import type { Subject, GradeLevel } from "@prisma/client";

const TOTAL_STEPS = 4;

// Pre-computed confetti particles
const CONFETTI_PARTICLES = Array.from({ length: 40 }).map((_, i) => ({
  left: (i * 2.5) % 100,
  color: ["#10B981", "#6366F1", "#F59E0B", "#EC4899"][i % 4],
  rotate: (i * 18 - 360) % 720,
  xOffset: (i * 10 - 200) % 200,
  duration: 3 + (i % 10) * 0.2,
  delay: (i % 10) * 0.05,
}));

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
            y: 1200,
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

const INITIAL_DATA: TeacherOnboardingData = {
  profile: {
    headline: "",
    bio: "",
    specialties: [],
    yearsExperience: 0,
  },
  course: {
    title: "",
    description: "",
    subject: "MATHEMATIQUES" as Subject,
    gradeLevel: "SIXIEME" as GradeLevel,
    price: 2500,
    chapters: [],
  },
  stripeConnected: false,
};

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--kursus-bg)]">
      <Loader2 className="h-8 w-8 animate-spin text-[#ff6d38]" />
    </div>
  );
}

function TeacherOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [currentStep, setCurrentStep] =
    useState<TeacherOnboardingStep>("welcome");
  const [stepNumber, setStepNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [publishedCourse, setPublishedCourse] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [onboardingData, setOnboardingData] =
    useState<TeacherOnboardingData>(INITIAL_DATA);

  // Check for Stripe callback
  useEffect(() => {
    const stripeStatus = searchParams.get("stripe");
    if (stripeStatus === "success") {
      setOnboardingData((prev) => ({ ...prev, stripeConnected: true }));
    }
  }, [searchParams]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/teacher-onboarding");
    }
  }, [status, router]);

  // Update step number based on current step
  useEffect(() => {
    const stepMap: Record<TeacherOnboardingStep, number> = {
      welcome: 1,
      profile: 2,
      "course-ai": 3,
      preview: 4,
      complete: 4,
    };
    setStepNumber(stepMap[currentStep]);
  }, [currentStep]);

  const updateData = useCallback((updates: Partial<TeacherOnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePublish = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/teacher/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(onboardingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur de publication");
      }

      // Success! Show confetti and complete step
      setPublishedCourse({
        id: result.courseId,
        title: result.courseTitle,
      });
      setShowConfetti(true);
      setCurrentStep("complete");

      setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation handlers
  const goToWelcome = () => setCurrentStep("welcome");
  const goToProfile = () => setCurrentStep("profile");
  const goToCourseAI = () => setCurrentStep("course-ai");
  const goToPreview = () => setCurrentStep("preview");

  if (status === "loading") {
    return <LoadingFallback />;
  }

  if (!session) {
    return null;
  }

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
    <div className="min-h-screen bg-[var(--kursus-bg)]">
      {/* Confetti */}
      <Confetti active={showConfetti} />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Header */}
        {currentStep !== "complete" && (
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-[#ff6d38]/10 px-4 py-2 text-sm font-medium text-[#ff6d38]"
            >
              <GraduationCap className="h-4 w-4" />
              Devenir Professeur Kursus
            </motion.div>
          </div>
        )}

        {/* Progress Bar */}
        {currentStep !== "welcome" && currentStep !== "complete" && (
          <div className="mb-8">
            <TeacherOnboardingProgress
              currentStep={stepNumber}
              totalSteps={TOTAL_STEPS}
            />
          </div>
        )}

        {/* Step Content */}
        <div className="overflow-hidden rounded-2xl border border-[var(--kursus-border)] bg-[var(--kursus-bg-elevated)] shadow-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              custom={stepNumber}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "tween", duration: 0.3 }}
            >
              {currentStep === "welcome" && (
                <WelcomeStep
                  onNext={goToProfile}
                  userName={session.user?.name || "Professeur"}
                />
              )}

              {currentStep === "profile" && (
                <ProfileStep
                  data={onboardingData}
                  updateData={updateData}
                  onNext={goToCourseAI}
                  onBack={goToWelcome}
                />
              )}

              {currentStep === "course-ai" && (
                <CourseAIStep
                  data={onboardingData}
                  updateData={updateData}
                  onNext={goToPreview}
                  onBack={goToProfile}
                />
              )}

              {currentStep === "preview" && (
                <PreviewStep
                  data={onboardingData}
                  onPublish={handlePublish}
                  onBack={goToCourseAI}
                  isLoading={isLoading}
                />
              )}

              {currentStep === "complete" && publishedCourse && (
                <CompleteStep
                  courseId={publishedCourse.id}
                  courseTitle={publishedCourse.title}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Motivation Footer */}
        {currentStep !== "complete" && currentStep !== "welcome" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 rounded-xl border border-[#7a78ff]/30 bg-[#7a78ff]/10 p-4 text-center"
          >
            <p className="text-sm text-[var(--kursus-text)]">
              <strong>Astuce :</strong> Les professeurs qui publient leur
              premier cours aujourd&apos;hui gagnent en moyenne{" "}
              <span className="font-bold text-[var(--kursus-purple-text)]">
                3x plus
              </span>{" "}
              le premier mois.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function TeacherOnboardingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TeacherOnboardingContent />
    </Suspense>
  );
}
