"use client";

import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["Enfant", "Matieres", "Objectifs", "Recommandations"];

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCurrent
                      ? "border-emerald-500 bg-white text-emerald-600"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isCurrent ? "text-emerald-600" : "text-gray-500"
                }`}
              >
                {STEP_LABELS[i]}
              </span>
            </div>

            {/* Connector Line */}
            {stepNumber < totalSteps && (
              <div
                className={`mx-2 h-0.5 w-8 sm:w-12 ${
                  isCompleted ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
