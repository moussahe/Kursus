"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherOnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["Bienvenue", "Profil", "Cours IA", "Publication"];

export function TeacherOnboardingProgress({
  currentStep,
  totalSteps,
}: TeacherOnboardingProgressProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-200">
        <motion.div
          className="h-full bg-[#7a78ff]"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Steps */}
      <div className="relative flex justify-between">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={label} className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                  isCompleted
                    ? "border-[#7a78ff] bg-[#7a78ff] text-white"
                    : isCurrent
                      ? "border-[#7a78ff] bg-white text-[#7a78ff]"
                      : "border-gray-200 bg-white text-gray-400",
                )}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                }}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent ? "text-[#7a78ff]" : "text-gray-400",
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
