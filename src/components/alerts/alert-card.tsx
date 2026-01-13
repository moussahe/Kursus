"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Bell,
  AlertTriangle,
  Trophy,
  Flame,
  FileText,
  Sparkles,
  X,
  ChevronRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMarkAlertRead, useDismissAlert } from "@/hooks/use-alerts";

type AlertType =
  | "INACTIVITY"
  | "LOW_QUIZ_SCORE"
  | "MILESTONE"
  | "STREAK"
  | "WEEKLY_REPORT"
  | "AI_INSIGHT";

type AlertPriority = "LOW" | "MEDIUM" | "HIGH";

interface AlertCardProps {
  alert: {
    id: string;
    type: AlertType;
    priority: AlertPriority;
    title: string;
    message: string;
    isRead: boolean;
    actionUrl: string | null;
    createdAt: string;
  };
  onDismiss?: () => void;
}

const alertConfig: Record<
  AlertType,
  { icon: typeof Bell; color: string; bgColor: string }
> = {
  INACTIVITY: {
    icon: Bell,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  LOW_QUIZ_SCORE: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  MILESTONE: {
    icon: Trophy,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  STREAK: {
    icon: Flame,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  WEEKLY_REPORT: {
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  AI_INSIGHT: {
    icon: Sparkles,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
};

const priorityStyles: Record<AlertPriority, string> = {
  LOW: "border-l-gray-400",
  MEDIUM: "border-l-blue-500",
  HIGH: "border-l-red-500",
};

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const markRead = useMarkAlertRead();
  const dismissAlert = useDismissAlert();

  const config = alertConfig[alert.type];
  const Icon = config.icon;

  const handleClick = () => {
    if (!alert.isRead) {
      markRead.mutate(alert.id);
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissAlert.mutate(alert.id, {
      onSuccess: () => onDismiss?.(),
    });
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markRead.mutate(alert.id);
  };

  const content = (
    <div
      className={cn(
        "relative rounded-lg border border-l-4 bg-white p-4 shadow-sm transition-all",
        priorityStyles[alert.priority],
        !alert.isRead && "ring-1 ring-blue-100",
        isHovered && "shadow-md",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
            config.bgColor,
          )}
        >
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={cn(
                "font-medium text-gray-900 line-clamp-1",
                !alert.isRead && "font-semibold",
              )}
            >
              {alert.title}
            </h4>
            <div className="flex items-center gap-1">
              {!alert.isRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleMarkRead}
                >
                  <Check className="h-3 w-3 text-gray-400" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {alert.message}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(alert.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
            {alert.actionUrl && (
              <span className="flex items-center text-xs font-medium text-emerald-600">
                Voir details <ChevronRight className="ml-1 h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </div>
      {!alert.isRead && (
        <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-blue-500" />
      )}
    </div>
  );

  if (alert.actionUrl) {
    return (
      <Link href={alert.actionUrl} onClick={handleClick} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
