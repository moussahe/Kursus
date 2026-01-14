"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChat } from "./ai-chat";
import { cn } from "@/lib/utils";

interface ChatContext {
  level: string;
  subject: string;
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
}

interface AIChatButtonProps {
  context: ChatContext;
  className?: string;
}

export function AIChatButton({ context, className }: AIChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg hover:from-violet-600 hover:to-purple-700",
          isOpen && "hidden",
          className,
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AIChat context={context} onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
