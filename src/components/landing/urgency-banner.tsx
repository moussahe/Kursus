"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

interface ExamInfo {
  name: string;
  daysLeft: number;
}

// Calculate days until next exam date
function getNextExamDate(): ExamInfo {
  const now = new Date();
  const currentYear = now.getFullYear();

  // Key exam dates in France (approximate)
  const examDates = [
    {
      name: "Brevet des collèges",
      date: new Date(currentYear, 5, 24), // Late June
    },
    {
      name: "Baccalauréat - Philosophie",
      date: new Date(currentYear, 5, 12), // Mid June
    },
    {
      name: "Baccalauréat - Grand Oral",
      date: new Date(currentYear, 5, 20), // Late June
    },
    {
      name: "Examens de fin d'année",
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
      name: "Brevet des collèges",
      date: new Date(currentYear + 1, 5, 24),
    };
  }

  const daysLeft = Math.ceil(
    (nextExam.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return { name: nextExam.name, daysLeft };
}

// Compute students online (stable per day)
function getStudentsOnline(): number {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return 150 + (dayOfYear % 200);
}

// Check if banner was dismissed
function wasBannerDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem("urgency_banner_dismissed");
    if (!dismissed) return false;

    const dismissedDate = new Date(dismissed);
    const hoursSince =
      (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60);
    // Show again after 24 hours
    return hoursSince < 24;
  } catch {
    return false;
  }
}

export function UrgencyBanner() {
  // Start with null to avoid hydration mismatch - don't render until client
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [studentsOnline, setStudentsOnline] = useState(0);

  // Only run on client after hydration - this pattern is intentional
  // to avoid hydration mismatches with localStorage and Date
  useEffect(() => {
    // Check if previously dismissed and initialize state
    const dismissed = wasBannerDismissed();
    const exam = getNextExamDate();
    const students = getStudentsOnline();

    // Batch all state updates - intentional client-side initialization
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDismissed(dismissed);
    setExamInfo(exam);
    setStudentsOnline(students);
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(
        "urgency_banner_dismissed",
        new Date().toISOString(),
      );
    } catch {
      // localStorage might not be available
    }
  };

  // Don't render anything on server or if dismissed
  if (!mounted || isDismissed || !examInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed left-0 right-0 top-0 z-[60] bg-[#0a0a0a] border-b border-white/5"
      >
        <div className="container mx-auto px-4">
          <div className="relative flex flex-wrap items-center justify-center gap-4 py-2.5 text-sm text-white md:gap-6">
            {/* Exam Countdown */}
            {examInfo.daysLeft <= 90 && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#ff9494]" />
                <span className="text-gray-300">
                  <strong className="text-white">{examInfo.name}</strong> dans{" "}
                  <span className="font-bold text-[#ff9494]">
                    {examInfo.daysLeft}
                  </span>{" "}
                  jours
                </span>
              </div>
            )}

            {/* Separator */}
            {examInfo.daysLeft <= 90 && (
              <div className="hidden h-4 w-px bg-white/10 md:block" />
            )}

            {/* Students Online */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#ff9494]" />
              <span className="text-gray-300">
                <strong className="text-[#ff9494]">{studentsOnline}+</strong>{" "}
                élèves actifs maintenant
              </span>
            </div>

            {/* CTA */}
            <Link
              href="/courses"
              className="rounded-full bg-[#ff9494] px-4 py-1.5 text-xs font-bold text-[#0a0a0a] transition-all hover:bg-[#ffb8b8] hover:shadow-[0_0_20px_-5px_rgba(255,109,56,0.5)]"
            >
              Découvrir les cours
            </Link>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
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
        className="flex items-center gap-1 rounded-full bg-[#ff9494] px-2.5 py-1 text-xs font-bold text-[#0a0a0a] shadow-lg"
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
      <div className="flex items-center gap-1 rounded-full bg-[#ff9494] px-2.5 py-1 text-xs font-bold text-white shadow-lg">
        <Calendar className="h-3 w-3" />
        {labels[examType]}
      </div>
    </div>
  );
}
