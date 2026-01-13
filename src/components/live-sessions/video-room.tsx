"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  MessageSquare,
  Users,
  Maximize2,
  Minimize2,
  Loader2,
  AlertCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoRoomProps {
  sessionId: string;
  userRole: "parent" | "teacher";
  className?: string;
}

interface RoomData {
  roomUrl: string;
  roomName: string;
  sessionId: string;
  title: string;
  subject: string;
  duration: number;
  scheduledAt: string;
  status: string;
  userRole: string;
  teacher: {
    name: string;
  };
  child: {
    firstName: string;
  };
  config: {
    startAudioOff: boolean;
    startVideoOff: boolean;
    showLeaveButton: boolean;
    showFullscreenButton: boolean;
    showParticipantsBar: boolean;
  };
}

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

export function VideoRoom({ sessionId, userRole, className }: VideoRoomProps) {
  const router = useRouter();
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/live-sessions/${sessionId}/room`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur de chargement");
        }

        setRoomData(data);
        setIsVideoOn(!data.config.startVideoOff);
        setIsAudioOn(!data.config.startAudioOff);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [sessionId]);

  // Timer
  useEffect(() => {
    if (!roomData || roomData.status !== "IN_PROGRESS") return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [roomData]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndSession = async () => {
    if (!confirm("Etes-vous sur de vouloir terminer la session ?")) return;

    setIsEnding(true);
    try {
      const response = await fetch(`/api/live-sessions/${sessionId}/room`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la fermeture");
      }

      router.push(`/${userRole}/live-sessions/${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsEnding(false);
    }
  };

  const handleLeave = () => {
    if (confirm("Etes-vous sur de vouloir quitter la session ?")) {
      router.push(`/${userRole}/live-sessions`);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center bg-gray-900",
          className,
        )}
      >
        <div className="text-center text-white">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
          <p className="mt-4">Chargement de la salle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center bg-gray-900",
          className,
        )}
      >
        <div className="mx-auto max-w-md rounded-xl bg-white p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Impossible de rejoindre la session
          </h2>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
          <Button
            onClick={() => router.push(`/${userRole}/live-sessions`)}
            className="mt-4"
          >
            Retour aux sessions
          </Button>
        </div>
      </div>
    );
  }

  if (!roomData) return null;

  return (
    <div className={cn("flex min-h-screen flex-col bg-gray-900", className)}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white">{roomData.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {SUBJECTS[roomData.subject]}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {roomData.teacher.name} & {roomData.child.firstName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2">
            <Clock className="h-4 w-4 text-emerald-500" />
            <span className="font-mono text-white">
              {formatTime(elapsedTime)}
            </span>
            <span className="text-gray-400">/ {roomData.duration} min</span>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm text-emerald-500">En direct</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex flex-1">
        {/* Video area */}
        <div className="flex flex-1 items-center justify-center p-4">
          {/* In a real implementation, this would be the Daily.co iframe or video component */}
          <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-gray-800">
            {/* Main video placeholder */}
            <div className="flex h-full items-center justify-center">
              {isVideoOn ? (
                <div className="text-center text-white">
                  <Video className="mx-auto h-16 w-16 opacity-50" />
                  <p className="mt-4 text-gray-400">
                    La video sera affichee ici
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Integration Daily.co / autre service video
                  </p>
                  {roomData.roomUrl && (
                    <a
                      href={roomData.roomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
                    >
                      Ouvrir dans Daily.co
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center text-white">
                  <VideoOff className="mx-auto h-16 w-16 opacity-50" />
                  <p className="mt-4 text-gray-400">Camera desactivee</p>
                </div>
              )}
            </div>

            {/* Self video (PIP) */}
            <div className="absolute bottom-4 right-4 h-32 w-48 overflow-hidden rounded-lg border-2 border-gray-700 bg-gray-900">
              {isVideoOn ? (
                <div className="flex h-full items-center justify-center text-gray-500">
                  <span className="text-sm">Vous</span>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <VideoOff className="h-8 w-8 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <div className="w-80 border-l border-gray-800 bg-gray-850">
            <div className="flex h-full flex-col">
              <div className="border-b border-gray-800 p-4">
                <h3 className="font-medium text-white">Chat</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-center text-sm text-gray-500">
                  Le chat sera disponible ici
                </p>
              </div>
              <div className="border-t border-gray-800 p-4">
                <input
                  type="text"
                  placeholder="Envoyer un message..."
                  className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Controls */}
      <footer className="border-t border-gray-800 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Video toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={cn(
              "h-14 w-14 rounded-full",
              isVideoOn
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-red-600 text-white hover:bg-red-700",
            )}
          >
            {isVideoOn ? (
              <Video className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </Button>

          {/* Audio toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsAudioOn(!isAudioOn)}
            className={cn(
              "h-14 w-14 rounded-full",
              isAudioOn
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : "bg-red-600 text-white hover:bg-red-700",
            )}
          >
            {isAudioOn ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </Button>

          {/* Chat toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className={cn(
              "h-14 w-14 rounded-full",
              showChat
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-gray-800 text-white hover:bg-gray-700",
            )}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>

          {/* Fullscreen toggle */}
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleFullscreen}
            className="h-14 w-14 rounded-full bg-gray-800 text-white hover:bg-gray-700"
          >
            {isFullscreen ? (
              <Minimize2 className="h-6 w-6" />
            ) : (
              <Maximize2 className="h-6 w-6" />
            )}
          </Button>

          {/* End/Leave session */}
          {userRole === "teacher" ? (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleEndSession}
              disabled={isEnding}
              className="h-14 w-14 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              {isEnding ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <PhoneOff className="h-6 w-6" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              onClick={handleLeave}
              className="h-14 w-14 rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
