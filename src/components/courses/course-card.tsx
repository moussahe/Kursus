"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CourseCardProps {
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string | null;
    imageUrl?: string | null;
    price: number;
    gradeLevel: string;
    subject: string;
    totalStudents: number;
    totalLessons: number;
    totalDuration: number;
    averageRating: number;
    reviewCount: number;
    author: {
      name: string | null;
      image?: string | null;
    };
  };
}

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

// Memoize the price formatter to avoid recreation
const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function CourseCardComponent({ course }: CourseCardProps) {
  const formatPrice = (price: number) => priceFormatter.format(price / 100);

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
              <BookOpen className="h-12 w-12 text-white/80" />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge className="bg-background/90 text-foreground backdrop-blur-sm">
              {gradeLevelLabels[course.gradeLevel] || course.gradeLevel}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Subject */}
          <div className="mb-2">
            <span className="text-xs font-medium text-emerald-600">
              {subjectLabels[course.subject] || course.subject}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 font-semibold text-foreground group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Subtitle */}
          {course.subtitle && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {course.subtitle}
            </p>
          )}

          {/* Author */}
          <div className="mt-3 flex items-center gap-2">
            {course.author.image ? (
              <Image
                src={course.author.image}
                alt={course.author.name || "Professeur"}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-medium text-emerald-600">
                {course.author.name?.charAt(0) || "P"}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {course.author.name || "Professeur"}
            </span>
          </div>

          {/* Stats */}
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">
                {course.averageRating.toFixed(1)}
              </span>
              <span>({course.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.totalStudents}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.totalDuration}min</span>
            </div>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <span className="text-lg font-bold text-primary">
              {formatPrice(course.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              {course.totalLessons} lecons
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Memoize to prevent unnecessary re-renders in lists
export const CourseCard = memo(CourseCardComponent);
