"use client";

import { AlertTriangle, Award, Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface Alert {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  childName?: string;
  actionLabel?: string;
  actionHref?: string;
  createdAt: Date;
}

interface AlertsPanelProps {
  alerts: Alert[];
  className?: string;
}

const alertStyles = {
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    iconBg: "bg-amber-100",
    IconComponent: AlertTriangle,
  },
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    iconBg: "bg-emerald-100",
    IconComponent: Award,
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    iconBg: "bg-blue-100",
    IconComponent: Calendar,
  },
};

export function AlertsPanel({
  alerts: initialAlerts,
  className,
}: AlertsPanelProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleAlerts = initialAlerts.filter((a) => !dismissed.has(a.id));

  const dismissAlert = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-gray-700">
        Alertes & Notifications
      </h3>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => {
          const style = alertStyles[alert.type];
          const Icon = style.IconComponent;

          return (
            <div
              key={alert.id}
              className={cn(
                "relative flex items-start gap-3 rounded-xl border p-4 transition-all",
                style.bg,
              )}
            >
              <div className={cn("flex-shrink-0 rounded-lg p-2", style.iconBg)}>
                <Icon className={cn("h-4 w-4", style.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.childName && (
                        <span className="text-emerald-600">
                          {alert.childName}
                        </span>
                      )}
                      {alert.childName && " - "}
                      {alert.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-white/50 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                {alert.actionLabel && alert.actionHref && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs"
                  >
                    <a href={alert.actionHref}>{alert.actionLabel}</a>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
