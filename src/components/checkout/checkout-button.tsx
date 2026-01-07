"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChildren } from "@/hooks/use-children";
import { toast } from "sonner";

interface CheckoutButtonProps {
  courseId: string;
  price: number;
  className?: string;
}

export function CheckoutButton({
  courseId,
  price,
  className,
}: CheckoutButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { data: children } = useChildren();

  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(priceInCents / 100);
  };

  const handleCheckout = useCallback(async () => {
    // Not logged in - redirect to login
    if (status === "unauthenticated" || !session?.user) {
      router.push(`/login?callbackUrl=/courses/${courseId}`);
      return;
    }

    // Parent must select a child
    if (
      session.user.role === "PARENT" &&
      children &&
      children.length > 0 &&
      !selectedChildId
    ) {
      toast.error("Veuillez selectionner un enfant");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          childId: selectedChildId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la creation du paiement");
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("URL de paiement non recue");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de la creation du paiement",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId, selectedChildId, status, session, children, router]);

  const isParentWithChildren =
    session?.user?.role === "PARENT" && children && children.length > 0;

  return (
    <div className={className}>
      {/* Child selector for parents */}
      {isParentWithChildren && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pour quel enfant ?
          </label>
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Selectionner un enfant" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName || ""} ({child.gradeLevel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Checkout button */}
      <Button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-xl py-6 text-lg font-semibold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Chargement...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-5 w-5" />
            Acheter - {formatPrice(price)}
          </>
        )}
      </Button>

      {/* Info */}
      <p className="mt-3 text-center text-xs text-gray-500">
        Paiement securise par Stripe. Acces a vie.
      </p>
    </div>
  );
}
