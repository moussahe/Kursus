"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

const gradeLevels = [
  { value: "all", label: "Tous les niveaux" },
  { value: "CP", label: "CP" },
  { value: "CE1", label: "CE1" },
  { value: "CE2", label: "CE2" },
  { value: "CM1", label: "CM1" },
  { value: "CM2", label: "CM2" },
  { value: "SIXIEME", label: "6eme" },
  { value: "CINQUIEME", label: "5eme" },
  { value: "QUATRIEME", label: "4eme" },
  { value: "TROISIEME", label: "3eme" },
  { value: "SECONDE", label: "2nde" },
  { value: "PREMIERE", label: "1ere" },
  { value: "TERMINALE", label: "Terminale" },
];

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

const priceRanges = [
  { value: "all", label: "Tous les prix" },
  { value: "10", label: "Moins de 10 EUR" },
  { value: "20", label: "Moins de 20 EUR" },
  { value: "30", label: "Moins de 30 EUR" },
  { value: "50", label: "Moins de 50 EUR" },
  { value: "100", label: "Moins de 100 EUR" },
];

const sortOptions = [
  { value: "recent", label: "Plus recents" },
  { value: "populaire", label: "Plus populaires" },
  { value: "note", label: "Mieux notes" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix decroissant" },
];

export function CourseCatalogFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "") {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      return params.toString();
    },
    [searchParams],
  );

  const handleFilterChange = (name: string, value: string) => {
    const queryString = createQueryString(name, value);
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters =
    searchParams.has("niveau") ||
    searchParams.has("matiere") ||
    searchParams.has("prix") ||
    searchParams.has("tri");

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Filtres</h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-transparent"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Grade Level */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Niveau</Label>
          <Select
            value={searchParams.get("niveau") || "all"}
            onValueChange={(value) => handleFilterChange("niveau", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les niveaux" />
            </SelectTrigger>
            <SelectContent>
              {gradeLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Matiere</Label>
          <Select
            value={searchParams.get("matiere") || "all"}
            onValueChange={(value) => handleFilterChange("matiere", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les matieres" />
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

        {/* Price */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Prix maximum</Label>
          <Select
            value={searchParams.get("prix") || "all"}
            onValueChange={(value) => handleFilterChange("prix", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les prix" />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((price) => (
                <SelectItem key={price.value} value={price.value}>
                  {price.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Trier par</Label>
          <Select
            value={searchParams.get("tri") || "recent"}
            onValueChange={(value) => handleFilterChange("tri", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Plus recents" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
