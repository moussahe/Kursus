"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

// Calculate days until next exam date
function getNextExamDate(): { name: string; date: Date; daysLeft: number } {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Key exam dates in France (approximate)
  const examDates = [
    {
      name: "Brevet des colleges",
      date: new Date(currentYear, 5, 24), // Late June
    },
    {
      name: "Baccalaureat - Philosophie",
      date: new Date(currentYear, 5, 12), // Mid June
    },
    {
      name: "Baccalaureat - Grand Oral",
      date: new Date(currentYear, 5, 20), // Late June
    },
    {
      name: "Examens de fin d'annee",
      date: new Date(currentYear, 5, 15), // Mid June
    },
  ];

  // Find the next upcoming exam
  let nextExam = examDates
    .filter((exam) => exam.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  // If no exam this year, show next year's dates
  if (!nextExam) {
    nextExam = {
      name: "Brevet des colleges",
      date: new Date(currentYear + 1, 5, 24),
    };
  }

  const daysLeft = Math.ceil(
    (nextExam.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return { ...nextExam, daysLeft };
}

// Check if banner was dismissed (client-side only)
function wasBannerDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const dismissed = localStorage.getItem("urgency_banner_dismissed");
  if (!dismissed) return false;

  const dismissedDate = new Date(dismissed);
  const hoursSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60);
  // Show again after 24 hours
  return hoursSince < 24;
}

// Compute students online (stable per session)
function getStudentsOnline(): number {
  // Use day of year as seed for consistent number during the day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );
  return 150 + (dayOfYear % 200);
}

export function UrgencyBanner() {
  // Compute initial state synchronously
  const examInfo = useMemo(() => {
    const exam = getNextExamDate();
    return { name: exam.name, daysLeft: exam.daysLeft };
  }, []);

  const studentsOnline = useMemo(() => getStudentsOnline(), []);

  // Track visibility state (starts true, user can dismiss)
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage on first render via useMemo
  const initiallyHidden = useMemo(() => {
    if (typeof window === "undefined") return false;
    return wasBannerDismissed();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "urgency_banner_dismissed",
        new Date().toISOString(),
      );
    }
  };

  // Don't render if dismissed or initially hidden
  if (isDismissed || initiallyHidden) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed left-0 right-0 top-0 z-[60] bg-gradient-to-r from-[#0B2A4C] to-[#1a4a7c]"
      >
        <div className="container mx-auto px-4">
          <div className="relative flex flex-wrap items-center justify-center gap-4 py-2.5 text-sm text-white md:gap-6">
            {/* Exam Countdown */}
            {examInfo.daysLeft <= 90 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#E8A336]" />
                <span>
                  <strong>{examInfo.name}</strong> dans{" "}
                  <span className="font-bold text-[#E8A336]">
                    {examInfo.daysLeft}
                  </span>{" "}
                  jours
                </span>
              </div>
            )}

            {/* Separator */}
            {examInfo.daysLeft <= 90 && (
              <div className="hidden h-4 w-px bg-white/30 md:block" />
            )}

            {/* Students Online */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>
                <strong className="text-emerald-400">{studentsOnline}+</strong>{" "}
                élèves actifs maintenant
              </span>
            </div>

            {/* CTA */}
            <Link
              href="/demo"
              className="rounded-full bg-[#E8A336] px-4 py-1.5 text-xs font-bold text-[#0B2A4C] transition-colors hover:bg-[#D4922E]"
            >
              Commencer maintenant
            </Link>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Course card urgency badge
export function LimitedSpotsBadge({ spotsLeft }: { spotsLeft: number }) {
  if (spotsLeft > 10) return null;

  return (
    <div className="absolute left-3 top-3 z-10">
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.9, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg"
      >
        <Clock className="h-3 w-3" />
        Plus que {spotsLeft} places !
      </motion.div>
    </div>
  );
}

// Exam prep badge for courses
export function ExamPrepBadge({ examType }: { examType: "brevet" | "bac" }) {
  const labels = {
    brevet: "Prep Brevet",
    bac: "Prep Bac",
  };

  return (
    <div className="absolute right-3 top-3 z-10">
      <div className="flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
        <Calendar className="h-3 w-3" />
        {labels[examType]}
      </div>
    </div>
  );
}
