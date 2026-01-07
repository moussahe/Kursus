"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PurchaseFiltersProps {
  childrenList: {
    id: string;
    firstName: string;
    lastName?: string | null;
  }[];
  currentChildId?: string;
  currentStatus?: string;
}

const statusOptions = [
  { value: "all", label: "Tous les statuts" },
  { value: "COMPLETED", label: "Completes" },
  { value: "PENDING", label: "En attente" },
  { value: "REFUNDED", label: "Rembourses" },
  { value: "FAILED", label: "Echoues" },
];

export function PurchaseFilters({
  childrenList,
  currentChildId,
  currentStatus,
}: PurchaseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/parent/purchases?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/parent/purchases");
  };

  const hasFilters = currentChildId || currentStatus;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          Filtrer par:
        </div>

        <div className="flex flex-1 flex-wrap gap-3">
          {/* Child Filter */}
          <Select
            value={currentChildId ?? "all"}
            onValueChange={(value) => updateFilter("childId", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les enfants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les enfants</SelectItem>
              {childrenList.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={currentStatus ?? "all"}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Effacer les filtres
          </Button>
        )}
      </div>
    </div>
  );
}
