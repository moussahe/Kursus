"use client";

import { useQuery, useMutation } from "@tanstack/react-query";

interface Purchase {
  id: string;
  amount: number;
  platformFee: number;
  teacherRevenue: number;
  status: "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";
  createdAt: string;
  course: {
    id: string;
    slug: string;
    title: string;
    imageUrl?: string | null;
    author: {
      name: string | null;
    };
  };
  child?: {
    id: string;
    firstName: string;
    lastName?: string | null;
  } | null;
}

interface PaginatedPurchases {
  items: Purchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface PurchaseFilters {
  childId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

// Fetch user's purchases
export function usePurchases(filters: PurchaseFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return useQuery<PaginatedPurchases>({
    queryKey: ["purchases", filters],
    queryFn: async () => {
      const res = await fetch(`/api/purchases?${params.toString()}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des achats");
      return res.json();
    },
  });
}

// Check if user has purchased a course
export function useHasPurchased(courseId: string) {
  return useQuery<{ hasPurchased: boolean }>({
    queryKey: ["purchase-check", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/purchases/check?courseId=${courseId}`);
      if (!res.ok) throw new Error("Erreur de verification");
      return res.json();
    },
    enabled: !!courseId,
  });
}

// Create checkout session
export function useCreateCheckout() {
  return useMutation({
    mutationFn: async ({
      courseId,
      childId,
    }: {
      courseId: string;
      childId?: string;
    }) => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, childId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error.error || "Erreur lors de la creation du paiement",
        );
      }
      return res.json();
    },
  });
}
