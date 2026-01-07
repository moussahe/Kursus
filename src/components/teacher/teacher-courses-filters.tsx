"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback, useState, useTransition } from "react";

const subjects = [
  { value: "all", label: "Toutes les matieres" },
  { value: "MATHEMATIQUES", label: "Mathematiques" },
  { value: "FRANCAIS", label: "Francais" },
  { value: "HISTOIRE_GEO", label: "Histoire-Geo" },
  { value: "SCIENCES", label: "Sciences" },
  { value: "ANGLAIS", label: "Anglais" },
  { value: "PHYSIQUE_CHIMIE", label: "Physique-Chimie" },
  { value: "SVT", label: "SVT" },
  { value: "PHILOSOPHIE", label: "Philosophie" },
  { value: "ESPAGNOL", label: "Espagnol" },
  { value: "ALLEMAND", label: "Allemand" },
  { value: "SES", label: "SES" },
  { value: "NSI", label: "NSI" },
];

const statuses = [
  { value: "all", label: "Tous les statuts" },
  { value: "published", label: "Publies" },
  { value: "draft", label: "Brouillons" },
];

export function TeacherCoursesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
  );

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params.toString();
    },
    [searchParams],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);

      // Debounce the search
      const timeoutId = setTimeout(() => {
        startTransition(() => {
          const queryString = createQueryString({ search: value || null });
          router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
        });
      }, 300);

      return () => clearTimeout(timeoutId);
    },
    [createQueryString, pathname, router],
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      startTransition(() => {
        const queryString = createQueryString({
          [key]: value === "all" ? null : value,
        });
        router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
      });
    },
    [createQueryString, pathname, router],
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Rechercher un cours..."
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="rounded-xl pl-10"
        />
      </div>

      <div className="flex gap-3">
        {/* Status Filter */}
        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subject Filter */}
        <Select
          defaultValue={searchParams.get("subject") ?? "all"}
          onValueChange={(value) => handleFilterChange("subject", value)}
        >
          <SelectTrigger className="w-[180px] rounded-xl">
            <SelectValue placeholder="Matiere" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject.value} value={subject.value}>
                {subject.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isPending && (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      )}
    </div>
  );
}
