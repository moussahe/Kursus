"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { Clock, AlertTriangle, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizTimerProps {
  /** Total time in seconds */
  totalSeconds: number;
  /** Called when timer reaches zero */
  onTimeUp: () => void;
  /** Whether the timer is active */
  isActive: boolean;
  /** Show pause button (for practice mode) */
  allowPause?: boolean;
  /** Compact display mode */
  compact?: boolean;
  /** Warning threshold in seconds (shows warning animation) */
  warningThreshold?: number;
  /** Critical threshold in seconds (shows critical animation) */
  criticalThreshold?: number;
}

export function QuizTimer({
  totalSeconds,
  onTimeUp,
  isActive,
  allowPause = false,
  compact = false,
  warningThreshold = 60,
  criticalThreshold = 30,
}: QuizTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep onTimeUp ref updated
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Timer countdown effect
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Use setTimeout to avoid calling during render
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Reset timer if totalSeconds changes
  useEffect(() => {
    setRemainingSeconds(totalSeconds);
  }, [totalSeconds]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progressPercent = (remainingSeconds / totalSeconds) * 100;

  // Determine status for styling
  const isWarning =
    remainingSeconds <= warningThreshold &&
    remainingSeconds > criticalThreshold;
  const isCritical = remainingSeconds <= criticalThreshold;

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          isCritical
            ? "animate-pulse bg-red-100 text-red-700"
            : isWarning
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-600",
        )}
      >
        <Clock
          className={cn(
            "h-4 w-4",
            isCritical && "animate-bounce",
            isWarning && "text-amber-600",
          )}
        />
        <span>{formatTime(remainingSeconds)}</span>
        {isPaused && <span className="text-xs text-gray-400">(pause)</span>}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              isCritical
                ? "bg-red-100"
                : isWarning
                  ? "bg-amber-100"
                  : "bg-gray-100",
            )}
          >
            {isCritical ? (
              <AlertTriangle className="h-4 w-4 animate-pulse text-red-600" />
            ) : (
              <Clock
                className={cn(
                  "h-4 w-4",
                  isWarning ? "text-amber-600" : "text-gray-500",
                )}
              />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700">
            Temps restant
          </span>
        </div>

        {allowPause && (
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePause}
            className="h-8 w-8 p-0"
          >
            {isPaused ? (
              <Play className="h-4 w-4 text-emerald-600" />
            ) : (
              <Pause className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        )}
      </div>

      {/* Timer Display */}
      <div
        className={cn(
          "mt-3 text-center text-3xl font-bold tabular-nums transition-colors",
          isCritical
            ? "animate-pulse text-red-600"
            : isWarning
              ? "text-amber-600"
              : "text-gray-900",
        )}
      >
        {formatTime(remainingSeconds)}
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              isCritical
                ? "bg-red-500"
                : isWarning
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Status Messages */}
      {isCritical && (
        <p className="mt-2 text-center text-xs font-medium text-red-600">
          Depeche-toi ! Le temps presse !
        </p>
      )}
      {isWarning && !isCritical && (
        <p className="mt-2 text-center text-xs font-medium text-amber-600">
          Attention, plus qu&apos;une minute !
        </p>
      )}
      {isPaused && (
        <p className="mt-2 text-center text-xs font-medium text-gray-500">
          Quiz en pause
        </p>
      )}
    </div>
  );
}
