"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Target, Loader2 } from "lucide-react";
import type { GoalType, GoalPeriod, Subject } from "@prisma/client";

interface GoalFormDialogProps {
  childId: string;
  childName: string;
  onSuccess?: () => void;
}

const goalTypeOptions: {
  value: GoalType;
  label: string;
  defaultTarget: number;
}[] = [
  { value: "LESSONS_COMPLETED", label: "Leçons a terminer", defaultTarget: 5 },
  { value: "QUIZ_SCORE", label: "Score moyen aux quiz (%)", defaultTarget: 80 },
  { value: "TIME_SPENT", label: "Temps d'etude (minutes)", defaultTarget: 60 },
  { value: "STREAK_DAYS", label: "Jours consecutifs", defaultTarget: 5 },
  {
    value: "COURSE_PROGRESS",
    label: "Progression cours (%)",
    defaultTarget: 50,
  },
];

const periodOptions: { value: GoalPeriod; label: string }[] = [
  { value: "DAILY", label: "Quotidien" },
  { value: "WEEKLY", label: "Hebdomadaire" },
  { value: "MONTHLY", label: "Mensuel" },
];

const subjectOptions: { value: Subject; label: string }[] = [
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

const xpRewardOptions = [
  { value: 25, label: "25 XP (facile)" },
  { value: 50, label: "50 XP (moyen)" },
  { value: 100, label: "100 XP (difficile)" },
  { value: 200, label: "200 XP (defi)" },
];

export function GoalFormDialog({
  childId,
  childName,
  onSuccess,
}: GoalFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<GoalType>("LESSONS_COMPLETED");
  const [period, setPeriod] = useState<GoalPeriod>("WEEKLY");
  const [target, setTarget] = useState(5);
  const [subject, setSubject] = useState<Subject | "">("");
  const [xpReward, setXpReward] = useState(50);

  const handleTypeChange = (value: GoalType) => {
    setType(value);
    const option = goalTypeOptions.find((o) => o.value === value);
    if (option) {
      setTarget(option.defaultTarget);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childId,
          type,
          period,
          target,
          xpReward,
          ...(subject ? { subject } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la creation");
      }

      setOpen(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-violet-200 text-violet-600 hover:bg-violet-50"
        >
          <Plus className="h-4 w-4" />
          Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-violet-500" />
            Creer un objectif pour {childName}
          </DialogTitle>
          <DialogDescription>
            Definissez un objectif d&apos;etude motivant pour votre enfant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type d&apos;objectif</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un type" />
              </SelectTrigger>
              <SelectContent>
                {goalTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Periode</Label>
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as GoalPeriod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une periode" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Objectif a atteindre</Label>
            <Input
              id="target"
              type="number"
              min={1}
              max={1000}
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
            />
            <p className="text-xs text-gray-500">
              {type === "QUIZ_SCORE" || type === "COURSE_PROGRESS"
                ? "En pourcentage (%)"
                : type === "TIME_SPENT"
                  ? "En minutes"
                  : type === "STREAK_DAYS"
                    ? "Nombre de jours consecutifs"
                    : "Nombre de leçons"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Matiere (optionnel)</Label>
            <Select
              value={subject}
              onValueChange={(v) => setSubject(v as Subject)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Toutes les matieres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les matieres</SelectItem>
                {subjectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="xpReward">Recompense XP</Label>
            <Select
              value={xpReward.toString()}
              onValueChange={(v) => setXpReward(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir une recompense" />
              </SelectTrigger>
              <SelectContent>
                {xpRewardOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creation...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Creer l&apos;objectif
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
