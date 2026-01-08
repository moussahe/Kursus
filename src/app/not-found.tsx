import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <span className="text-8xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            404
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page introuvable
        </h1>
        <p className="text-gray-600 mb-8">
          Desolee, la page que vous recherchez n&apos;existe pas ou a ete
          deplacee.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              Explorer les cours
            </Button>
          </Link>
        </div>
        <div className="mt-8">
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a la page precedente
          </Link>
        </div>
      </div>
    </div>
  );
}
