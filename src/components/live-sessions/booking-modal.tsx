"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SessionSlotList } from "./session-booking-card";
import type { AvailableSlot } from "@/types/live-session";

interface Child {
  id: string;
  firstName: string;
  gradeLevel: string;
}

const SUBJECTS = [
  { value: "MATHEMATIQUES", label: "Mathematiques" },
  { value: "FRANCAIS", label: "Francais" },
  { value: "HISTOIRE_GEO", label: "Histoire-Geo" },
  { value: "SCIENCES", label: "Sciences" },
  { value: "ANGLAIS", label: "Anglais" },
  { value: "PHYSIQUE_CHIMIE", label: "Physique-Chimie" },
  { value: "SVT", label: "SVT" },
  { value: "PHILOSOPHIE", label: "Philosophie" },
  { value: "ESPAGNOL", label: "Espagnol" },
  { value: "ALLEMAND", label: "Allemand" },
  { value: "SES", label: "SES" },
  { value: "NSI", label: "NSI" },
];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  preSelectedSubject?: string;
}

type BookingStep =
  | "select-child"
  | "select-subject"
  | "select-slot"
  | "confirm"
  | "success";

export function BookingModal({
  isOpen,
  onClose,
  children,
  preSelectedSubject,
}: BookingModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<BookingStep>("select-child");
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(
    preSelectedSubject || "",
  );
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [bookedSession, setBookedSession] = useState<{ id: string } | null>(
    null,
  );

  const fetchSlots = useCallback(async () => {
    setIsLoadingSlots(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        subject: selectedSubject,
        days: "14", // Look ahead 2 weeks
      });
      if (selectedChild) {
        params.set("gradeLevel", selectedChild.gradeLevel);
      }

      const response = await fetch(
        `/api/live-sessions/available-slots?${params}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la recherche");
      }

      setSlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedSubject, selectedChild]);

  // Fetch available slots when subject is selected
  useEffect(() => {
    if (selectedSubject && step === "select-slot") {
      fetchSlots();
    }
  }, [selectedSubject, step, fetchSlots]);

  const handleBook = async () => {
    if (!selectedChild || !selectedSubject || !selectedSlot) return;

    setIsBooking(true);
    setError(null);

    try {
      const scheduledAt = new Date(
        `${selectedSlot.date}T${selectedSlot.startTime}:00`,
      );

      const response = await fetch("/api/live-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: selectedSlot.teacherId,
          childId: selectedChild.id,
          subject: selectedSubject,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          title:
            sessionTitle ||
            `Session de ${SUBJECTS.find((s) => s.value === selectedSubject)?.label}`,
          description: sessionDescription || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la reservation");
      }

      setBookedSession(data);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsBooking(false);
    }
  };

  const handleClose = () => {
    setStep("select-child");
    setSelectedChild(null);
    setSelectedSubject(preSelectedSubject || "");
    setSelectedSlot(null);
    setSessionTitle("");
    setSessionDescription("");
    setSlots([]);
    setError(null);
    setBookedSession(null);
    onClose();
  };

  const goBack = () => {
    switch (step) {
      case "select-subject":
        setStep("select-child");
        break;
      case "select-slot":
        setStep("select-subject");
        break;
      case "confirm":
        setStep("select-slot");
        break;
    }
  };

  const goNext = () => {
    switch (step) {
      case "select-child":
        if (selectedChild) setStep("select-subject");
        break;
      case "select-subject":
        if (selectedSubject) setStep("select-slot");
        break;
      case "select-slot":
        if (selectedSlot) setStep("confirm");
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            {step !== "select-child" && step !== "success" && (
              <button
                onClick={goBack}
                className="rounded-lg p-1 hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">
              {step === "success"
                ? "Reservation confirmee !"
                : "Reserver une session"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Step: Select Child */}
          {step === "select-child" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Selectionnez l&apos;enfant pour cette session :
              </p>
              <div className="space-y-2">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-4 transition-all",
                      selectedChild?.id === child.id
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-200 hover:border-violet-300",
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-lg font-semibold text-violet-600">
                      {child.firstName.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        {child.firstName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {child.gradeLevel}
                      </p>
                    </div>
                    {selectedChild?.id === child.id && (
                      <CheckCircle2 className="ml-auto h-5 w-5 text-violet-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Select Subject */}
          {step === "select-subject" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Choisissez la matiere :</p>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez une matiere" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step: Select Slot */}
          {step === "select-slot" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Choisissez un creneau :</p>
              <SessionSlotList
                slots={slots}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                isLoading={isLoadingSlots}
              />
            </div>
          )}

          {/* Step: Confirm */}
          {step === "confirm" && selectedSlot && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900">Resume</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedChild?.firstName}
                  </p>
                  <p className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {SUBJECTS.find((s) => s.value === selectedSubject)?.label}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedSlot.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </p>
                  <p className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Avec {selectedSlot.teacherName}
                  </p>
                </div>
                <div className="mt-4 border-t border-gray-200 pt-3">
                  <p className="text-lg font-bold text-violet-600">
                    {(selectedSlot.price / 100).toFixed(2).replace(".", ",")}{" "}
                    EUR
                  </p>
                </div>
              </div>

              {/* Optional details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Titre de la session (optionnel)
                  </label>
                  <Input
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Ex: Aide sur les fractions"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Description (optionnel)
                  </label>
                  <Textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="Decrivez ce que vous aimeriez aborder..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Session reservee !
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Vous recevrez un rappel avant la session.
              </p>
              {bookedSession && (
                <Button
                  className="mt-6"
                  onClick={() => {
                    handleClose();
                    router.push(`/parent/live-sessions/${bookedSession.id}`);
                  }}
                >
                  Voir les details
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "success" && (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            {step === "confirm" ? (
              <Button
                onClick={handleBook}
                disabled={isBooking}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reservation...
                  </>
                ) : (
                  "Confirmer"
                )}
              </Button>
            ) : (
              <Button
                onClick={goNext}
                disabled={
                  (step === "select-child" && !selectedChild) ||
                  (step === "select-subject" && !selectedSubject) ||
                  (step === "select-slot" && !selectedSlot)
                }
              >
                Continuer
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
