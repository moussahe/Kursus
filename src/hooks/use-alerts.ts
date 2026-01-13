"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Alert {
  id: string;
  parentId: string;
  childId: string | null;
  type:
    | "INACTIVITY"
    | "LOW_QUIZ_SCORE"
    | "MILESTONE"
    | "STREAK"
    | "WEEKLY_REPORT"
    | "AI_INSIGHT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  isRead: boolean;
  isDismissed: boolean;
  actionUrl: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface AlertsResponse {
  alerts: Alert[];
  unreadCount: number;
}

interface UseAlertsOptions {
  childId?: string;
  unreadOnly?: boolean;
  limit?: number;
}

export function useAlerts(options: UseAlertsOptions = {}) {
  const { childId, unreadOnly = false, limit = 20 } = options;

  return useQuery<AlertsResponse>({
    queryKey: ["alerts", { childId, unreadOnly, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (childId) params.set("childId", childId);
      if (unreadOnly) params.set("unreadOnly", "true");
      params.set("limit", limit.toString());

      const res = await fetch(`/api/alerts?${params}`);
      if (!res.ok) throw new Error("Erreur de chargement des alertes");
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

export function useUnreadAlertCount() {
  return useQuery<number>({
    queryKey: ["alerts", "unreadCount"],
    queryFn: async () => {
      const res = await fetch("/api/alerts?unreadOnly=true&limit=1");
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();
      return data.unreadCount;
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useMarkAlertsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertIds: string[]) => {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertIds }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
