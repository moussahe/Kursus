"use client";

import { useState } from "react";
import { User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingStepProps, GradeLevel } from "@/types/onboarding";
import { GRADE_LEVEL_LABELS } from "@/types/onboarding";

const GRADE_GROUPS = [
  {
    label: "Primaire",
    grades: ["CP", "CE1", "CE2", "CM1", "CM2"] as GradeLevel[],
  },
  {
    label: "College",
    grades: ["SIXIEME", "CINQUIEME", "QUATRIEME", "TROISIEME"] as GradeLevel[],
  },
  {
    label: "Lycee",
    grades: ["SECONDE", "PREMIERE", "TERMINALE"] as GradeLevel[],
  },
];

export function OnboardingStep1({
  data,
  updateData,
  onNext,
}: OnboardingStepProps) {
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({
      child: { ...data.child, firstName: e.target.value },
    });
    if (error) setError(null);
  };

  const handleGradeSelect = (grade: GradeLevel) => {
    updateData({
      child: { ...data.child, gradeLevel: grade },
    });
    if (error) setError(null);
  };

  const handleNext = () => {
    if (!data.child.firstName.trim()) {
      setError("Veuillez entrer le prenom de votre enfant");
      return;
    }
    if (!data.child.gradeLevel) {
      setError("Veuillez selectionner le niveau scolaire");
      return;
    }
    onNext();
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <User className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Parlons de votre enfant
          </h2>
          <p className="text-sm text-gray-600">
            Ces informations nous aident a personnaliser l&apos;experience
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Child Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-base font-medium">
            Prenom de l&apos;enfant
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Ex: Lucas"
            value={data.child.firstName}
            onChange={handleNameChange}
            className="h-12 text-lg"
            autoFocus
          />
        </div>

        {/* Grade Level Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Niveau scolaire</Label>

          {GRADE_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-2 text-sm font-medium text-gray-500">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.grades.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeSelect(grade)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      data.child.gradeLevel === grade
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {GRADE_LEVEL_LABELS[grade]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
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
