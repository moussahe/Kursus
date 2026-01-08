"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oups ! Une erreur est survenue
        </h1>
        <p className="text-gray-600 mb-8">
          Nous sommes desoles, quelque chose s&apos;est mal passe. Veuillez
          reessayer ou retourner a l&apos;accueil.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => reset()} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reessayer
          </Button>
          <Link href="/">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Retour a l&apos;accueil
            </Button>
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-gray-400">
            Code erreur: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
