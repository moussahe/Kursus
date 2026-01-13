"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DAYS_OF_WEEK, type TeacherAvailability } from "@/types/live-session";

// Generate time options (every 30 min from 06:00 to 22:00)
const TIME_OPTIONS = Array.from({ length: 33 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
});

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  timezone: string;
}

interface TeacherAvailabilityManagerProps {
  className?: string;
}

export function TeacherAvailabilityManager({
  className,
}: TeacherAvailabilityManagerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing availability
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/teacher/availability");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de chargement");
      }

      setSlots(
        data.map((slot: TeacherAvailability) => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive,
          timezone: slot.timezone,
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const handleUpdateSlot = (
    index: number,
    field: keyof AvailabilitySlot,
    value: unknown,
  ) => {
    setSlots(
      slots.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot,
      ),
    );
    setHasChanges(true);
    setSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate slots
      for (const slot of slots) {
        if (slot.startTime >= slot.endTime) {
          throw new Error("L'heure de fin doit etre apres l'heure de debut");
        }
      }

      const response = await fetch("/api/teacher/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slots),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur de sauvegarde");
      }

      // Update with server response
      setSlots(
        data.map((slot: TeacherAvailability) => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive,
          timezone: slot.timezone,
        })),
      );
      setHasChanges(false);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsSaving(false);
    }
  };

  // Group slots by day for display
  const slotsByDay = slots.reduce(
    (acc, slot, index) => {
      if (!acc[slot.dayOfWeek]) {
        acc[slot.dayOfWeek] = [];
      }
      acc[slot.dayOfWeek].push({ ...slot, originalIndex: index });
      return acc;
    },
    {} as Record<number, (AvailabilitySlot & { originalIndex: number })[]>,
  );

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Vos Disponibilites
          </h2>
          <p className="text-sm text-gray-500">
            Definissez vos creneaux pour les sessions en direct
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-sm text-amber-600">
              Modifications non sauvegardees
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Disponibilites sauvegardees avec succes !
        </div>
      )}

      {/* Slots by day */}
      <div className="space-y-4">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day.value}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">{day.label}</h3>
              {slotsByDay[day.value]?.length > 0 && (
                <span className="text-sm text-gray-500">
                  {slotsByDay[day.value].length} creneau(x)
                </span>
              )}
            </div>

            {slotsByDay[day.value]?.length > 0 ? (
              <div className="mt-3 space-y-2">
                {slotsByDay[day.value].map((slot) => (
                  <div
                    key={slot.originalIndex}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3",
                      slot.isActive
                        ? "border-gray-200 bg-gray-50"
                        : "border-gray-100 bg-gray-50 opacity-50",
                    )}
                  >
                    {/* Time selectors */}
                    <div className="flex items-center gap-2">
                      <Select
                        value={slot.startTime}
                        onValueChange={(value) =>
                          handleUpdateSlot(
                            slot.originalIndex,
                            "startTime",
                            value,
                          )
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <span className="text-gray-400">-</span>
                      <Select
                        value={slot.endTime}
                        onValueChange={(value) =>
                          handleUpdateSlot(slot.originalIndex, "endTime", value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_OPTIONS.filter((t) => t > slot.startTime).map(
                            (time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slot.isActive}
                        onCheckedChange={(checked) =>
                          handleUpdateSlot(
                            slot.originalIndex,
                            "isActive",
                            checked,
                          )
                        }
                      />
                      <span className="text-sm text-gray-500">
                        {slot.isActive ? "Actif" : "Inactif"}
                      </span>
                    </div>

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSlot(slot.originalIndex)}
                      className="ml-auto h-8 w-8 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">
                Aucun creneau ce jour
              </p>
            )}

            {/* Add slot for this day */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSlots([
                  ...slots,
                  {
                    dayOfWeek: day.value,
                    startTime: "09:00",
                    endTime: "12:00",
                    isActive: true,
                    timezone: "Europe/Paris",
                  },
                ]);
                setHasChanges(true);
              }}
              className="mt-2 text-violet-600 hover:text-violet-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              Ajouter un creneau
            </Button>
          </div>
        ))}
      </div>

      {/* Quick add all weekdays */}
      {slots.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 font-medium text-gray-900">
            Aucune disponibilite configuree
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Ajoutez vos creneaux pour que les parents puissent reserver
          </p>
          <Button
            onClick={() => {
              // Add default availability (Mon-Fri, 9-18)
              const defaultSlots: AvailabilitySlot[] = [1, 2, 3, 4, 5].map(
                (day) => ({
                  dayOfWeek: day,
                  startTime: "09:00",
                  endTime: "18:00",
                  isActive: true,
                  timezone: "Europe/Paris",
                }),
              );
              setSlots(defaultSlots);
              setHasChanges(true);
            }}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter les jours ouvrables
          </Button>
        </div>
      )}
    </div>
  );
}
