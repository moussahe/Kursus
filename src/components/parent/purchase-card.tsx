"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { BookOpen, User, Calendar, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PurchaseCardProps {
  purchase: {
    id: string;
    amount: number;
    status: "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";
    createdAt: string;
    course: {
      id: string;
      slug: string;
      title: string;
      imageUrl?: string | null;
      author: {
        name: string | null;
      };
    };
    child?: {
      id: string;
      firstName: string;
      lastName?: string | null;
    } | null;
  };
}

const statusLabels: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  PENDING: { label: "En attente", variant: "secondary" },
  COMPLETED: { label: "Complete", variant: "default" },
  REFUNDED: { label: "Rembourse", variant: "outline" },
  FAILED: { label: "Echoue", variant: "destructive" },
};

export function PurchaseCard({ purchase }: PurchaseCardProps) {
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(priceInCents / 100);
  };

  const statusConfig = statusLabels[purchase.status] || statusLabels.PENDING;

  return (
    <Card className="overflow-hidden rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Course Image */}
          <div className="relative aspect-video sm:aspect-square sm:w-40 flex-shrink-0">
            {purchase.course.imageUrl ? (
              <Image
                src={purchase.course.imageUrl}
                alt={purchase.course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
                <BookOpen className="h-10 w-10 text-white/80" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                {/* Status & Date */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(purchase.createdAt), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </span>
                </div>

                {/* Course Title */}
                <Link
                  href={`/courses/${purchase.course.slug}`}
                  className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2"
                >
                  {purchase.course.title}
                </Link>

                {/* Teacher */}
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {purchase.course.author.name || "Professeur"}
                </p>

                {/* Assigned child */}
                {purchase.child && (
                  <p className="text-sm text-emerald-600 mt-2">
                    Pour: {purchase.child.firstName}{" "}
                    {purchase.child.lastName || ""}
                  </p>
                )}
              </div>

              {/* Price & Actions */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4">
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(purchase.amount)}
                </p>

                <div className="flex gap-2">
                  {purchase.status === "COMPLETED" && (
                    <Link href={`/parent/courses/${purchase.course.id}`}>
                      <Button
                        size="sm"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                      >
                        Acceder au cours
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => {
                      // TODO: Download invoice
                      console.log("Download invoice:", purchase.id);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
