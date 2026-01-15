"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  CheckCircle2,
  GraduationCap,
  MoreVertical,
  Flag,
  Trash2,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReplyCardProps {
  reply: {
    id: string;
    content: string;
    isAccepted: boolean;
    voteScore: number;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      role: string;
      teacherProfile?: {
        headline: string | null;
        isVerified: boolean;
      } | null;
    };
    child?: {
      id: string;
      firstName: string;
      gradeLevel?: string;
    } | null;
    childReplies?: ReplyCardProps["reply"][];
    _count?: {
      votes: number;
      childReplies: number;
    };
  };
  topicId: string;
  topicAuthorId: string;
  currentUserId?: string;
  currentUserRole?: string;
  onReply?: (replyId: string) => void;
  onAccept?: (replyId: string) => void;
  isNested?: boolean;
}

export function ReplyCard({
  reply,
  topicId,
  topicAuthorId,
  currentUserId,
  currentUserRole,
  onReply,
  onAccept,
  isNested = false,
}: ReplyCardProps) {
  const [voteState, setVoteState] = useState<number>(0);
  const [currentScore, setCurrentScore] = useState(reply.voteScore);
  const [isVoting, setIsVoting] = useState(false);

  const displayName = reply.child
    ? reply.child.firstName
    : reply.author.name || "Anonyme";
  const isTeacher = reply.author.role === "TEACHER";
  const isAuthor = reply.author.id === currentUserId;
  const isTopicAuthor = topicAuthorId === currentUserId;
  const isModerator =
    currentUserRole === "ADMIN" || currentUserRole === "TEACHER";

  const handleVote = async (value: 1 | -1) => {
    if (!currentUserId) {
      toast.error("Connexion requise", {
        description: "Connectez-vous pour voter",
      });
      return;
    }

    if (isAuthor) {
      toast.error("Action non autorisee", {
        description: "Vous ne pouvez pas voter pour votre propre réponse",
      });
      return;
    }

    setIsVoting(true);
    try {
      const newValue = voteState === value ? 0 : value;
      const response = await fetch(
        `/api/forums/${topicId}/replies/${reply.id}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: newValue }),
        },
      );

      if (!response.ok) throw new Error("Vote failed");

      const scoreDiff = newValue - voteState;
      setVoteState(newValue);
      setCurrentScore((prev) => prev + scoreDiff);
    } catch {
      toast.error("Erreur", {
        description: "Impossible de voter",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleAccept = async () => {
    if (onAccept) {
      onAccept(reply.id);
    }
  };

  return (
    <div
      className={cn(
        "relative",
        isNested && "ml-8 pl-4 border-l-2 border-muted",
      )}
    >
      <div
        className={cn(
          "rounded-lg p-4",
          reply.isAccepted
            ? "bg-green-50 border border-green-200"
            : "bg-muted/30",
        )}
      >
        {/* Accepted badge */}
        {reply.isAccepted && (
          <div className="flex items-center gap-2 mb-3 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Meilleure réponse</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {reply.author.image ? (
              <Image
                src={reply.author.image}
                alt={displayName}
                width={36}
                height={36}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-medium text-white">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Author info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {displayName}
                </span>
                {isTeacher && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 text-xs"
                  >
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Prof
                  </Badge>
                )}
                {reply.author.teacherProfile?.isVerified && (
                  <Badge variant="outline" className="text-xs">
                    Verifie
                  </Badge>
                )}
              </div>
              {reply.author.teacherProfile?.headline && (
                <p className="text-xs text-muted-foreground">
                  {reply.author.teacherProfile.headline}
                </p>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(reply.createdAt), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>

          {/* Actions menu */}
          {currentUserId && (isAuthor || isModerator) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isModerator && !isAuthor && (
                  <DropdownMenuItem>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Masquer
                  </DropdownMenuItem>
                )}
                {isAuthor && (
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Signaler
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="mt-3 text-sm text-foreground whitespace-pre-wrap">
          {reply.content}
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center gap-4">
          {/* Votes */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", voteState === 1 && "text-emerald-600")}
              onClick={() => handleVote(1)}
              disabled={isVoting || isAuthor}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span
              className={cn(
                "text-sm font-medium min-w-[2ch] text-center",
                currentScore > 0 && "text-emerald-600",
                currentScore < 0 && "text-red-600",
              )}
            >
              {currentScore}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", voteState === -1 && "text-red-600")}
              onClick={() => handleVote(-1)}
              disabled={isVoting || isAuthor}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Reply button */}
          {!isNested && onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => onReply(reply.id)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Repondre
            </Button>
          )}

          {/* Accept answer (topic author only) */}
          {isTopicAuthor && !reply.isAccepted && !isNested && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={handleAccept}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Accepter
            </Button>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {reply.childReplies && reply.childReplies.length > 0 && (
        <div className="mt-3 space-y-3">
          {reply.childReplies.map((childReply) => (
            <ReplyCard
              key={childReply.id}
              reply={childReply}
              topicId={topicId}
              topicAuthorId={topicAuthorId}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isNested
            />
          ))}
        </div>
      )}
    </div>
  );
}
