"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Video,
  Star,
  User,
  BookOpen,
  MoreVertical,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { LiveSessionStatus } from "@/types/live-session";

interface LiveSessionCardProps {
  session: {
    id: string;
    title: string;
    subject: string;
    scheduledAt: Date | string;
    duration: number;
    status: LiveSessionStatus;
    price: number;
    roomUrl?: string | null;
    rating?: number | null;
    teacher: {
      id: string;
      name: string | null;
      image: string | null;
      teacherProfile?: {
        headline: string | null;
        avatarUrl: string | null;
        averageRating: number;
      } | null;
    };
    child: {
      id: string;
      firstName: string;
      gradeLevel: string;
    };
  };
  userRole: "parent" | "teacher" | "admin";
  onCancel?: (sessionId: string) => void;
  onRateSession?: (sessionId: string) => void;
  className?: string;
}

const STATUS_CONFIG: Record<
  LiveSessionStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  SCHEDULED: {
    label: "Programmee",
    color: "bg-blue-100 text-blue-700",
    icon: Calendar,
  },
  IN_PROGRESS: {
    label: "En cours",
    color: "bg-emerald-100 text-emerald-700",
    icon: Play,
  },
  COMPLETED: {
    label: "Terminee",
    color: "bg-gray-100 text-gray-700",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Annulee",
    color: "bg-red-100 text-red-700",
    icon: X,
  },
  NO_SHOW: {
    label: "Absence",
    color: "bg-amber-100 text-amber-700",
    icon: AlertCircle,
  },
};

const SUBJECTS: Record<string, string> = {
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

export function LiveSessionCard({
  session,
  userRole,
  onCancel,
  onRateSession,
  className,
}: LiveSessionCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const scheduledAt = new Date(session.scheduledAt);
  const endTime = new Date(scheduledAt.getTime() + session.duration * 60000);
  const now = new Date();
  const isUpcoming = session.status === "SCHEDULED" && scheduledAt > now;
  const canJoin =
    session.status === "SCHEDULED" &&
    scheduledAt <= new Date(now.getTime() + 15 * 60000) && // Can join 15 min before
    endTime > now;
  const isLive = session.status === "IN_PROGRESS";
  const canRate =
    session.status === "COMPLETED" && userRole === "parent" && !session.rating;

  const statusConfig = STATUS_CONFIG[session.status];
  const StatusIcon = statusConfig.icon;

  const handleCancel = async () => {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel(session.id);
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md",
        isLive && "border-emerald-500 ring-2 ring-emerald-100",
        className,
      )}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute left-0 right-0 top-0 flex items-center justify-center gap-2 bg-emerald-500 py-1 text-xs font-medium text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          En direct
        </div>
      )}

      <div className={cn("p-4", isLive && "pt-8")}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {userRole === "parent" ? (
              // Show teacher for parent
              session.teacher.image ||
              session.teacher.teacherProfile?.avatarUrl ? (
                <Image
                  src={
                    session.teacher.teacherProfile?.avatarUrl ||
                    session.teacher.image ||
                    ""
                  }
                  alt={session.teacher.name || "Professeur"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
                  <User className="h-6 w-6 text-violet-600" />
                </div>
              )
            ) : (
              // Show child for teacher
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-600">
                {session.child.firstName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {userRole === "parent"
                  ? session.teacher.name || "Professeur"
                  : session.child.firstName}
              </h3>
              <p className="text-sm text-gray-500">
                {userRole === "parent"
                  ? session.teacher.teacherProfile?.headline ||
                    SUBJECTS[session.subject]
                  : `${session.child.gradeLevel} - ${SUBJECTS[session.subject]}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                statusConfig.color,
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusConfig.label}
            </span>
            {isUpcoming && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/${userRole}/live-sessions/${session.id}`}>
                      Voir les details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="text-red-600 focus:text-red-600"
                  >
                    Annuler la session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Title */}
        <h4 className="mt-3 font-medium text-gray-900">{session.title}</h4>

        {/* Details */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(scheduledAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(scheduledAt)} - {formatTime(endTime)}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {SUBJECTS[session.subject]}
          </span>
        </div>

        {/* Rating (if completed) */}
        {session.status === "COMPLETED" && session.rating && (
          <div className="mt-3 flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < session.rating!
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300",
                )}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          {(canJoin || isLive) && (
            <Button
              asChild
              className={cn(
                isLive
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-violet-600 hover:bg-violet-700",
              )}
            >
              <Link href={`/${userRole}/live-sessions/${session.id}/room`}>
                <Video className="mr-2 h-4 w-4" />
                {isLive ? "Rejoindre" : "Entrer dans la salle"}
              </Link>
            </Button>
          )}

          {canRate && onRateSession && (
            <Button variant="outline" onClick={() => onRateSession(session.id)}>
              <Star className="mr-2 h-4 w-4" />
              Noter la session
            </Button>
          )}

          {!canJoin && !isLive && !canRate && (
            <Button variant="outline" asChild>
              <Link href={`/${userRole}/live-sessions/${session.id}`}>
                Voir les details
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
