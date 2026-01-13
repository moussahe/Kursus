"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  MessageSquare,
  Eye,
  Pin,
  Lock,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  FORUM_CATEGORY_LABELS,
  type ForumCategory,
} from "@/lib/validations/forum";

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    content: string;
    category: ForumCategory;
    subject?: string | null;
    gradeLevel?: string | null;
    isPinned: boolean;
    isLocked: boolean;
    isResolved: boolean;
    replyCount: number;
    viewCount: number;
    createdAt: string;
    lastReplyAt?: string | null;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      role: string;
    };
    child?: {
      id: string;
      firstName: string;
      gradeLevel: string;
    } | null;
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
  MATHEMATIQUES: "Maths",
  FRANCAIS: "Francais",
  HISTOIRE_GEO: "Histoire-Geo",
  SCIENCES: "Sciences",
  ANGLAIS: "Anglais",
  PHYSIQUE_CHIMIE: "Physique-Chimie",
  SVT: "SVT",
  PHILOSOPHIE: "Philo",
  ESPAGNOL: "Espagnol",
  ALLEMAND: "Allemand",
  SES: "SES",
  NSI: "NSI",
};

const categoryColors: Record<ForumCategory, string> = {
  GENERAL: "bg-gray-100 text-gray-700",
  HOMEWORK_HELP: "bg-blue-100 text-blue-700",
  STUDY_TIPS: "bg-purple-100 text-purple-700",
  EXAM_PREP: "bg-orange-100 text-orange-700",
  PARENT_CORNER: "bg-pink-100 text-pink-700",
  TEACHER_LOUNGE: "bg-emerald-100 text-emerald-700",
  ANNOUNCEMENTS: "bg-red-100 text-red-700",
};

export function TopicCard({ topic }: TopicCardProps) {
  const displayName = topic.child
    ? topic.child.firstName
    : topic.author.name || "Anonyme";

  const isTeacher = topic.author.role === "TEACHER";

  return (
    <Link href={`/community/${topic.id}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-all duration-200 hover:shadow-md",
          topic.isPinned && "border-emerald-200 bg-emerald-50/30",
        )}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Author avatar */}
            <div className="flex-shrink-0">
              {topic.author.image ? (
                <Image
                  src={topic.author.image}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-medium text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Title and badges */}
              <div className="flex flex-wrap items-center gap-2">
                {topic.isPinned && <Pin className="h-4 w-4 text-emerald-600" />}
                {topic.isLocked && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                {topic.isResolved && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {topic.title}
                </h3>
              </div>

              {/* Meta info */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", categoryColors[topic.category])}
                >
                  {FORUM_CATEGORY_LABELS[topic.category]}
                </Badge>
                {topic.subject && (
                  <Badge variant="outline" className="text-xs">
                    {subjectLabels[topic.subject] || topic.subject}
                  </Badge>
                )}
                {topic.gradeLevel && (
                  <Badge variant="outline" className="text-xs">
                    {gradeLevelLabels[topic.gradeLevel] || topic.gradeLevel}
                  </Badge>
                )}
              </div>

              {/* Preview */}
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {topic.content}
              </p>

              {/* Footer */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground">
                    {displayName}
                  </span>
                  {isTeacher && (
                    <GraduationCap className="h-3 w-3 text-emerald-600" />
                  )}
                </div>
                <span>
                  {formatDistanceToNow(new Date(topic.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{topic.replyCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{topic.viewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
