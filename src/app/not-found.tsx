"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--kursus-bg)] px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8">
          <span className="bg-gradient-to-r from-[#ff9494] to-[#fbbf24] bg-clip-text text-8xl font-black text-transparent">
            404
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--kursus-text)]">
          Page introuvable
        </h1>
        <p className="mb-8 text-[var(--kursus-text-muted)]">
          Desolee, la page que vous recherchez n&apos;existe pas ou a ete
          deplacee.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/">
            <Button
              className="w-full gap-2 sm:w-auto"
              style={{ background: "#ff9494" }}
            >
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Link href="/courses">
            <Button
              variant="outline"
              className="w-full gap-2 border-[var(--kursus-border)] text-[var(--kursus-text)] hover:bg-[var(--kursus-bg-elevated)] sm:w-auto"
            >
              <Search className="h-4 w-4" />
              Explorer les cours
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-[var(--kursus-text-muted)] hover:text-[#ff9494]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a la page precedente
          </button>
        </div>
      </div>
    </div>
  );
}
