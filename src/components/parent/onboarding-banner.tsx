"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OnboardingBannerProps {
  userName?: string;
  hasChildren: boolean;
  className?: string;
}

export function OnboardingBanner({
  userName,
  hasChildren,
  className,
}: OnboardingBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // If user has children, they likely completed onboarding already via that flow
  // But we still show the banner if they haven't formally completed the full onboarding
  const message = hasChildren
    ? "Terminez votre profil pour des recommandations personnalisees"
    : "Ajoutez votre premier enfant et configurez son parcours d'apprentissage";

  const handleDismiss = () => {
    setIsDismissed(true);
    // Save dismissal preference in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "onboarding_banner_dismissed",
        JSON.stringify({ dismissedAt: Date.now() }),
      );
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 shadow-lg",
          className,
        )}
      >
        {/* Background decoration */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-10">
          <svg
            className="h-full w-full"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <circle cx="100" cy="100" r="80" />
            <circle cx="160" cy="40" r="40" />
            <circle cx="40" cy="160" r="30" />
          </svg>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="text-white">
              <h3 className="text-lg font-semibold">
                {userName ? `${userName}, ` : ""}Completez votre profil !
              </h3>
              <p className="mt-1 text-sm text-white/80">{message}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-white/70">
                <Clock className="h-3 w-3" />
                <span>2 minutes seulement</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2 sm:flex-col">
            <Button
              asChild
              size="sm"
              className="bg-white font-medium text-emerald-600 shadow-sm hover:bg-white/90"
            >
              <Link href="/onboarding" className="flex items-center gap-2">
                Commencer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <button
              onClick={handleDismiss}
              className="hidden text-xs text-white/70 transition-colors hover:text-white sm:block"
            >
              Plus tard
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: hasChildren ? "25%" : "0%" }}
            />
          </div>
          <span className="text-xs text-white/70">
            {hasChildren ? "25%" : "0%"} complete
          </span>
        </div>

        {/* Social proof */}
        <p className="mt-3 text-center text-xs text-white/70 sm:text-left">
          <span className="font-semibold text-white">92%</span> des parents
          completent cette etape en moins de 2 minutes
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
