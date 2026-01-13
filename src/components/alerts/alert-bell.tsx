"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlerts, useMarkAlertsRead } from "@/hooks/use-alerts";
import { AlertCard } from "./alert-card";

export function AlertBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useAlerts({ limit: 10 });
  const markAllRead = useMarkAlertsRead();

  const unreadCount = data?.unreadCount ?? 0;
  const alerts = data?.alerts ?? [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const unreadIds = alerts.filter((a) => !a.isRead).map((a) => a.id);
    if (unreadIds.length > 0) {
      markAllRead.mutate(unreadIds);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={handleMarkAllRead}
                disabled={markAllRead.isPending}
              >
                {markAllRead.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-1 h-3 w-3" />
                    Tout marquer lu
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Aucune notification
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="border-t px-4 py-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-emerald-600 hover:text-emerald-700"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
