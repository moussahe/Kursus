"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Play,
  CheckCircle,
  BookOpen,
  Infinity,
  Shield,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutButton } from "@/components/checkout/checkout-button";

interface CoursePurchaseCardProps {
  courseId: string;
  price: number;
  imageUrl: string | null;
  previewVideoUrl: string | null;
}

export function CoursePurchaseCard({
  courseId,
  price,
  imageUrl,
  previewVideoUrl,
}: CoursePurchaseCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (priceInCents: number) => {
    if (priceInCents === 0) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(priceInCents / 100);
  };

  const features = [
    { icon: Infinity, text: "Acces a vie" },
    { icon: BookOpen, text: "Support pedagogique" },
    { icon: Shield, text: "Satisfait ou rembourse 30 jours" },
  ];

  return (
    <Card className="overflow-hidden rounded-2xl shadow-lg border-0">
      {/* Preview Image/Video */}
      <div className="relative aspect-video bg-gray-100">
        {showPreview && previewVideoUrl ? (
          <video
            src={previewVideoUrl}
            controls
            autoPlay
            className="h-full w-full object-cover"
          />
        ) : imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt="Apercu du cours"
              fill
              className="object-cover"
            />
            {previewVideoUrl && (
              <button
                onClick={() => setShowPreview(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <Play className="h-8 w-8 text-emerald-600 ml-1" />
                </div>
              </button>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
            <BookOpen className="h-16 w-16 text-white/80" />
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Price */}
        <div className="mb-6 text-center">
          <p className="text-4xl font-bold text-gray-900">
            {formatPrice(price)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Paiement unique - Acces a vie
          </p>
        </div>

        {/* Checkout Button */}
        <CheckoutButton courseId={courseId} price={price} />

        {/* Add to Wishlist */}
        <Button
          variant="outline"
          className="w-full h-12 text-base mt-3 rounded-xl"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart
            className={`h-5 w-5 mr-2 transition-colors ${
              isWishlisted ? "fill-red-500 text-red-500" : ""
            }`}
          />
          {isWishlisted ? "Dans ma liste" : "Ajouter a ma liste"}
        </Button>

        {/* Features */}
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-gray-900">Ce cours inclut :</p>
          {features.map(({ icon: Icon, text }, index) => (
            <div
              key={index}
              className="flex items-center gap-3 text-sm text-gray-600"
            >
              <Icon className="h-5 w-5 text-emerald-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="mt-6 rounded-xl bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-900">
                Garantie satisfaction
              </p>
              <p className="text-sm text-emerald-700">
                Remboursement integral sous 30 jours si vous n&apos;etes pas
                satisfait.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
