"use client";

import { useState, useCallback } from "react";
import type { WeakArea, GradeLevel, Subject } from "@prisma/client";
import {
  Brain,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  RefreshCw,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RevisionCard } from "./revision-card";

interface DueCard {
  id: string;
  weakArea: WeakArea;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
  totalReviews: number;
  successfulReviews: number;
}

interface Stats {
  totalCards: number;
  masteredCards: number;
  dueToday: number;
  averageEaseFactor: number;
  totalReviews: number;
  successRate: number;
  streakDays: number;
}

interface ScheduleItem {
  date: string;
  count: number;
}

interface RevisionDashboardProps {
  childId: string;
  childName: string;
  gradeLevel: GradeLevel;
  dueCards: DueCard[];
  stats: Stats;
  schedule: ScheduleItem[];
}

const subjectLabels: Record<Subject, string> = {
  MATHEMATIQUES: "Maths",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philo",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

export function RevisionDashboard({
  childId,
  gradeLevel,
  dueCards: initialDueCards,
  stats,
  schedule,
}: RevisionDashboardProps) {
  const [dueCards] = useState(initialDueCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    xpEarned: 0,
  });

  const currentCard = dueCards[currentCardIndex];
  const hasMoreCards = currentCardIndex < dueCards.length;

  const handleStartReview = useCallback(() => {
    setIsReviewing(true);
  }, []);

  const handleCardComplete = useCallback((wasCorrect: boolean, xp: number) => {
    setSessionStats((prev) => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (wasCorrect ? 1 : 0),
      xpEarned: prev.xpEarned + xp,
    }));
    setCurrentCardIndex((prev) => prev + 1);
  }, []);

  const handleFinishSession = useCallback(() => {
    setIsReviewing(false);
  }, []);

  // Review mode
  if (isReviewing) {
    if (!hasMoreCards) {
      return (
        <SessionComplete stats={sessionStats} onFinish={handleFinishSession} />
      );
    }

    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-500" />
            <span className="font-medium text-gray-900">
              Carte {currentCardIndex + 1} / {dueCards.length}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {sessionStats.correct}/{sessionStats.reviewed} correct
            </span>
            <Button variant="outline" size="sm" onClick={handleFinishSession}>
              Terminer
            </Button>
          </div>
        </div>

        <Progress
          value={(currentCardIndex / dueCards.length) * 100}
          className="h-2"
        />

        <RevisionCard
          cardId={currentCard.id}
          childId={childId}
          gradeLevel={gradeLevel}
          weakArea={currentCard.weakArea}
          cardStats={{
            repetitions: currentCard.repetitions,
            easeFactor: currentCard.easeFactor,
            totalReviews: currentCard.totalReviews,
            successfulReviews: currentCard.successfulReviews,
          }}
          onComplete={handleCardComplete}
        />
      </div>
    );
  }

  // Dashboard mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Revision Intelligente
        </h1>
        <p className="mt-1 text-gray-500">
          Revise tes points faibles avec la methode de repetition espacee
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <Clock className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dueToday}
                </p>
                <p className="text-sm text-gray-500">A reviser</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.masteredCards}
                </p>
                <p className="text-sm text-gray-500">Maitrises</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(stats.successRate)}%
                </p>
                <p className="text-sm text-gray-500">Réussite</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCards}
                </p>
                <p className="text-sm text-gray-500">Total cartes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Start Review CTA */}
        <div className="lg:col-span-2">
          {dueCards.length > 0 ? (
            <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {dueCards.length} concept{dueCards.length > 1 ? "s" : ""}{" "}
                      a revoir
                    </h2>
                    <p className="mt-1 text-violet-100">
                      La revision reguliere ameliore ta memoire de 40%
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...new Set(dueCards.map((c) => c.weakArea.subject))]
                        .slice(0, 3)
                        .map((subject) => (
                          <span
                            key={subject}
                            className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium"
                          >
                            {subjectLabels[subject]}
                          </span>
                        ))}
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-white text-violet-600 hover:bg-violet-50"
                    onClick={handleStartReview}
                  >
                    <Brain className="mr-2 h-5 w-5" />
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle2 className="h-16 w-16" />
                <h2 className="mt-4 text-xl font-bold">Tout est a jour !</h2>
                <p className="mt-2 text-emerald-100">
                  Tu as revise tous tes concepts pour aujourd&apos;hui. Reviens
                  demain !
                </p>
              </CardContent>
            </Card>
          )}

          {/* Due Cards Preview */}
          {dueCards.length > 0 && (
            <Card className="mt-4 rounded-2xl border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Concepts a revoir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dueCards.slice(0, 5).map((card, index) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                            card.easeFactor < 2
                              ? "bg-red-100 text-red-700"
                              : card.easeFactor < 2.3
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700",
                          )}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {card.weakArea.topic}
                          </p>
                          <p className="text-xs text-gray-500">
                            {subjectLabels[card.weakArea.subject]} -{" "}
                            {card.weakArea.category || "Comprehension"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {card.successfulReviews}/{card.totalReviews}
                        </p>
                        <p className="text-xs text-gray-500">reussies</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Schedule */}
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-violet-500" />
              Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {schedule.map((item, index) => {
                const date = new Date(item.date);
                const isToday = index === 0;
                const dayName = isToday
                  ? "Aujourd'hui"
                  : date.toLocaleDateString("fr-FR", { weekday: "short" });

                return (
                  <div
                    key={item.date}
                    className={cn(
                      "flex items-center justify-between rounded-lg p-3",
                      isToday ? "bg-violet-50" : "bg-gray-50",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium capitalize",
                          isToday ? "text-violet-700" : "text-gray-700",
                        )}
                      >
                        {dayName}
                      </span>
                      {!isToday && (
                        <span className="text-xs text-gray-500">
                          {date.getDate()}/{date.getMonth() + 1}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        item.count > 0
                          ? isToday
                            ? "bg-violet-500 text-white"
                            : "bg-gray-200 text-gray-700"
                          : "bg-gray-100 text-gray-400",
                      )}
                    >
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Comment ca marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <span className="font-bold text-violet-600">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Detection</p>
                <p className="text-sm text-gray-500">
                  On detecte tes points faibles dans les quiz
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <span className="font-bold text-violet-600">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Revision</p>
                <p className="text-sm text-gray-500">
                  Des questions ciblees pour chaque concept
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100">
                <span className="font-bold text-violet-600">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Memorisation</p>
                <p className="text-sm text-gray-500">
                  L&apos;algorithme SM-2 optimise les intervalles
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionComplete({
  stats,
  onFinish,
}: {
  stats: { reviewed: number; correct: number; xpEarned: number };
  onFinish: () => void;
}) {
  const accuracy =
    stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0;

  return (
    <div className="mx-auto max-w-md">
      <Card className="overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-xl">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <Award className="h-10 w-10" />
          </div>

          <h2 className="mt-6 text-2xl font-bold">Session terminée !</h2>

          <div className="mt-6 grid w-full grid-cols-3 gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <p className="text-2xl font-bold">{stats.reviewed}</p>
              <p className="text-xs text-violet-100">Revises</p>
            </div>
            <div className="rounded-xl bg-white/20 p-3">
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-violet-100">Réussite</p>
            </div>
            <div className="rounded-xl bg-white/20 p-3">
              <p className="text-2xl font-bold">+{stats.xpEarned}</p>
              <p className="text-xs text-violet-100">XP</p>
            </div>
          </div>

          {accuracy >= 80 && (
            <p className="mt-4 text-violet-100">
              Excellent travail ! Continue comme ca !
            </p>
          )}
          {accuracy >= 50 && accuracy < 80 && (
            <p className="mt-4 text-violet-100">
              Bon travail ! La repetition paye toujours.
            </p>
          )}
          {accuracy < 50 && (
            <p className="mt-4 text-violet-100">
              Ne te decourage pas ! Chaque revision compte.
            </p>
          )}

          <Button
            className="mt-6 bg-white text-violet-600 hover:bg-violet-50"
            onClick={onFinish}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
