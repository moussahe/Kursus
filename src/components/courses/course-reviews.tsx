"use client";

import Image from "next/image";
import { Star, ThumbsUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface CourseReviewsProps {
  courseId: string;
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export function CourseReviews({
  reviews,
  averageRating,
  reviewCount,
}: CourseReviewsProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
    return { rating, count, percentage };
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="text-xl font-bold mb-6">Avis des eleves</h2>

      <div className="grid gap-8 md:grid-cols-3 mb-8">
        {/* Average Rating */}
        <div className="text-center md:text-left">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex justify-center md:justify-start mb-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <p className="text-sm text-gray-500">{reviewCount} avis</p>
        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2 space-y-2">
          {ratingDistribution.map(({ rating, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-12">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-sm">{rating}</span>
              </div>
              <Progress value={percentage} className="flex-1 h-2" />
              <span className="text-sm text-gray-500 w-12 text-right">
                {percentage.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6 border-t pt-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="pb-6 border-b last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-4">
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name || "Utilisateur"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-600">
                    {review.user.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      {review.user.name || "Anonyme"}
                    </span>
                    {review.isVerified && (
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Achat verifie
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium mb-1">{review.title}</h4>
                  )}
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                  {review.helpfulCount > 0 && (
                    <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                      <ThumbsUp className="h-4 w-4" />
                      <span>
                        {review.helpfulCount} personnes ont trouve cet avis
                        utile
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun avis pour le moment.</p>
          <p className="text-sm mt-1">Soyez le premier a donner votre avis !</p>
        </div>
      )}
    </div>
  );
}
