"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

const gradeLevelLabels: Record<string, string> = {
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  SIXIEME: "6eme",
  CINQUIEME: "5eme",
  QUATRIEME: "4eme",
  TROISIEME: "3eme",
  SECONDE: "2nde",
  PREMIERE: "1ere",
  TERMINALE: "Terminale",
};

const subjectLabels: Record<string, string> = {
  MATHEMATIQUES: "Mathematiques",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philosophie",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

export function ActiveFilterBadges() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const niveau = searchParams.get("niveau");
  const matiere = searchParams.get("matiere");
  const prix = searchParams.get("prix");
  const q = searchParams.get("q");

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page"); // Reset pagination when filter changes
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
  };

  const hasFilters = niveau || matiere || prix || q;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Filtres actifs :</span>

      {q && (
        <button
          onClick={() => removeFilter("q")}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-200 transition-colors"
        >
          &quot;{q}&quot;
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {niveau && (
        <button
          onClick={() => removeFilter("niveau")}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 hover:bg-blue-200 transition-colors"
        >
          {gradeLevelLabels[niveau] || niveau}
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {matiere && (
        <button
          onClick={() => removeFilter("matiere")}
          className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 hover:bg-purple-200 transition-colors"
        >
          {subjectLabels[matiere] || matiere}
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {prix && (
        <button
          onClick={() => removeFilter("prix")}
          className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 hover:bg-amber-200 transition-colors"
        >
          Moins de {prix} EUR
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        onClick={() => router.push(pathname)}
        className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        Tout effacer
      </button>
    </div>
  );
}
