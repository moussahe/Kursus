"use client";

import { useState } from "react";
import {
  Target,
  ArrowLeft,
  ArrowRight,
  Check,
  TrendingUp,
  Award,
  Compass,
  HelpCircle,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { OnboardingStepProps, OnboardingGoal } from "@/types/onboarding";
import { GOAL_OPTIONS } from "@/types/onboarding";

const GOAL_ICONS: Record<string, React.ReactNode> = {
  TrendingUp: <TrendingUp className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  Award: <Award className="h-5 w-5" />,
  Compass: <Compass className="h-5 w-5" />,
  HelpCircle: <HelpCircle className="h-5 w-5" />,
  Smile: <Smile className="h-5 w-5" />,
};

export function OnboardingStep3({
  data,
  updateData,
  onNext,
  onBack,
}: OnboardingStepProps) {
  const [error, setError] = useState<string | null>(null);

  const toggleGoal = (goalId: OnboardingGoal) => {
    const isSelected = data.goals.includes(goalId);
    const newGoals = isSelected
      ? data.goals.filter((g) => g !== goalId)
      : [...data.goals, goalId];

    updateData({ goals: newGoals });
    if (error) setError(null);
  };

  const handleTimeChange = (value: number[]) => {
    updateData({ weeklyTime: value[0] });
  };

  const handleNext = () => {
    if (data.goals.length === 0) {
      setError("Selectionnez au moins un objectif");
      return;
    }
    onNext();
  };

  const getTimeLabel = (hours: number) => {
    if (hours <= 2) return "Leger";
    if (hours <= 5) return "Modere";
    if (hours <= 10) return "Intensif";
    return "Tres intensif";
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <Target className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Quels sont vos objectifs ?
          </h2>
          <p className="text-sm text-gray-600">
            Cela nous aide a recommander les meilleurs cours
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = data.goals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={`relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {isSelected && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  isSelected
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {GOAL_ICONS[goal.icon]}
              </div>
              <div>
                <p
                  className={`font-medium ${
                    isSelected ? "text-emerald-700" : "text-gray-900"
                  }`}
                >
                  {goal.label}
                </p>
                <p className="text-sm text-gray-500">{goal.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Weekly Time Slider */}
      <div className="mt-8 rounded-xl bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-gray-900">
            Temps d&apos;etude souhaite par semaine
          </p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {data.weeklyTime}h - {getTimeLabel(data.weeklyTime)}
          </span>
        </div>
        <Slider
          value={[data.weeklyTime]}
          onValueChange={handleTimeChange}
          min={1}
          max={15}
          step={1}
          className="w-full"
        />
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>1h</span>
          <span>5h</span>
          <span>10h</span>
          <span>15h</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack} className="h-12 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={handleNext}
          className="h-12 gap-2 bg-emerald-600 px-6 hover:bg-emerald-700"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
