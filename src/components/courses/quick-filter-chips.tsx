"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, TrendingUp, Star, Gift } from "lucide-react";

const quickFilters = [
  {
    label: "Populaires",
    href: "/courses?tri=populaire",
    icon: TrendingUp,
    color: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
    activeColor: "bg-orange-600 text-white border-orange-600",
    param: { key: "tri", value: "populaire" },
  },
  {
    label: "Mieux notes",
    href: "/courses?tri=note",
    icon: Star,
    color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    activeColor: "bg-amber-600 text-white border-amber-600",
    param: { key: "tri", value: "note" },
  },
  {
    label: "Mathematiques",
    href: "/courses?matiere=MATHEMATIQUES",
    icon: Sparkles,
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    activeColor: "bg-blue-600 text-white border-blue-600",
    param: { key: "matiere", value: "MATHEMATIQUES" },
  },
  {
    label: "Francais",
    href: "/courses?matiere=FRANCAIS",
    icon: null,
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    activeColor: "bg-purple-600 text-white border-purple-600",
    param: { key: "matiere", value: "FRANCAIS" },
  },
  {
    label: "Moins de 20 EUR",
    href: "/courses?prix=20",
    icon: Gift,
    color:
      "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    activeColor: "bg-emerald-600 text-white border-emerald-600",
    param: { key: "prix", value: "20" },
  },
];

export function QuickFilterChips() {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <span className="flex items-center text-sm text-muted-foreground mr-1">
        Filtres rapides :
      </span>
      {quickFilters.map((filter) => {
        const isActive =
          searchParams.get(filter.param.key) === filter.param.value;
        const Icon = filter.icon;

        return (
          <Link
            key={filter.label}
            href={filter.href}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
              isActive ? filter.activeColor : filter.color
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
