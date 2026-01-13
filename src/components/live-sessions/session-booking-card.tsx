"use client";

import Image from "next/image";
import { Calendar, Clock, Video, Star, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AvailableSlot } from "@/types/live-session";

interface SessionBookingCardProps {
  slot: AvailableSlot;
  onSelect: (slot: AvailableSlot) => void;
  isSelected?: boolean;
  className?: string;
}

export function SessionBookingCard({
  slot,
  onSelect,
  isSelected = false,
  className,
}: SessionBookingCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2).replace(".", ",") + " EUR";
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white p-4 transition-all",
        isSelected
          ? "border-violet-500 ring-2 ring-violet-200"
          : "border-gray-200 hover:border-violet-300 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {/* Teacher Avatar */}
        <div className="shrink-0">
          {slot.teacherImage ? (
            <Image
              src={slot.teacherImage}
              alt={slot.teacherName}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
              <User className="h-6 w-6 text-violet-600" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">
              {slot.teacherName}
            </h3>
            {slot.teacherRating && (
              <div className="flex items-center gap-1 text-sm text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span>{slot.teacherRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(slot.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {slot.startTime} - {slot.endTime}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-violet-600">
              {formatPrice(slot.price)}
            </span>
            <Button
              size="sm"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onSelect(slot)}
              className={cn(isSelected && "bg-violet-600 hover:bg-violet-700")}
            >
              {isSelected ? "Selectionne" : "Choisir"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video badge */}
      <div className="absolute right-2 top-2">
        <div className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
          <Video className="h-3 w-3" />
          Video
        </div>
      </div>
    </div>
  );
}

interface SessionSlotListProps {
  slots: AvailableSlot[];
  selectedSlot: AvailableSlot | null;
  onSelectSlot: (slot: AvailableSlot) => void;
  isLoading?: boolean;
  className?: string;
}

export function SessionSlotList({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
  className,
}: SessionSlotListProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-gray-300 p-8 text-center",
          className,
        )}
      >
        <Calendar className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Aucun creneau disponible
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          Essayez d&apos;elargir votre recherche ou de choisir une autre date.
        </p>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
      return acc;
    },
    {} as Record<string, AvailableSlot[]>,
  );

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(slotsByDate).map(([date, dateSlots]) => (
        <div key={date}>
          <h3 className="mb-3 text-sm font-medium text-gray-500">
            {new Date(date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>
          <div className="space-y-3">
            {dateSlots.map((slot, index) => (
              <SessionBookingCard
                key={`${slot.teacherId}-${slot.date}-${slot.startTime}-${index}`}
                slot={slot}
                onSelect={onSelectSlot}
                isSelected={
                  selectedSlot?.teacherId === slot.teacherId &&
                  selectedSlot?.date === slot.date &&
                  selectedSlot?.startTime === slot.startTime
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
