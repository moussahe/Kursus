"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchWithSuggestions } from "@/components/search/search-with-suggestions";

export function CourseCatalogHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold hidden sm:block">Kursus</span>
          </Link>

          {/* Search Bar - Desktop with Autocomplete */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <SearchWithSuggestions
              className="w-full"
              placeholder="Rechercher un cours, une matiere..."
            />
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/courses"
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              Catalogue
            </Link>
            <Link
              href="/register?role=teacher"
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              Devenir professeur
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Connexion</Link>
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href="/register">S&apos;inscrire</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Search Bar - Mobile with Autocomplete */}
        <div className="md:hidden pb-3">
          <SearchWithSuggestions
            className="w-full"
            placeholder="Rechercher un cours..."
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/courses"
              className="block py-2 text-base font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalogue
            </Link>
            <Link
              href="/register?role=teacher"
              className="block py-2 text-base font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Devenir professeur
            </Link>
            <div className="pt-4 flex flex-col gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Connexion</Link>
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href="/register">S&apos;inscrire</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
