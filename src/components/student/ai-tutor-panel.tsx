"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  Lightbulb,
  HelpCircle,
  BookOpen,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface LessonContext {
  level: string;
  subject: string;
  courseTitle: string;
  lessonTitle: string;
  chapterTitle: string;
  lessonContent?: string;
}

interface AITutorPanelProps {
  context: LessonContext;
  childId: string;
  courseId: string;
  lessonId: string;
  className?: string;
}

const QUICK_PROMPTS = [
  {
    icon: HelpCircle,
    label: "Je ne comprends pas",
    prompt:
      "Je ne comprends pas bien cette lecon. Peux-tu m'expliquer autrement ?",
  },
  {
    icon: Lightbulb,
    label: "Un exemple",
    prompt: "Peux-tu me donner un exemple concret pour mieux comprendre ?",
  },
  {
    icon: BookOpen,
    label: "Resume",
    prompt: "Peux-tu me faire un resume des points importants de cette lecon ?",
  },
];

export function AITutorPanel({
  context,
  childId,
  courseId,
  lessonId,
  className,
}: AITutorPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Creer une conversation
  const createConversation = async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, courseId, lessonId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de creation");
      }

      setConversationId(data.id);
      return data.id;
    } catch (err) {
      console.error("Erreur creation conversation:", err);
      return null;
    }
  };

  // Envoyer un message avec streaming
  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || isLoading) return;

    const userMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      let currentConvId = conversationId;

      // Creer une conversation si necessaire
      if (!currentConvId) {
        currentConvId = await createConversation();
        if (!currentConvId) {
          throw new Error("Impossible de creer la conversation");
        }
      }

      // Envoyer le message avec streaming
      const res = await fetch(
        `/api/ai/conversations/${currentConvId}/messages/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            context: {
              level: context.level,
              subject: context.subject,
              courseTitle: context.courseTitle,
              lessonTitle: context.lessonTitle,
            },
          }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur d'envoi");
      }

      // Traiter le stream SSE
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Stream non disponible");
      }

      const decoder = new TextDecoder();
      let assistantMessageId: string | undefined;
      let userMessageId: string | undefined;

      // Ajouter un message assistant vide pour le streaming
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "init") {
                userMessageId = data.userMessageId;
              } else if (data.type === "text") {
                // Mettre a jour le dernier message avec le nouveau texte
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex].role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: updated[lastIndex].content + data.text,
                    };
                  }
                  return updated;
                });
              } else if (data.type === "done") {
                assistantMessageId = data.assistantMessageId;
                // Finaliser les messages avec les IDs
                setMessages((prev) => {
                  const updated = [...prev];
                  // Trouver et mettre a jour le message utilisateur
                  const userIndex = updated.findIndex(
                    (m) => m.role === "user" && m.content === content && !m.id,
                  );
                  if (userIndex >= 0 && userMessageId) {
                    updated[userIndex] = {
                      ...updated[userIndex],
                      id: userMessageId,
                    };
                  }
                  // Finaliser le message assistant
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex].role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      id: assistantMessageId,
                      isStreaming: false,
                    };
                  }
                  return updated;
                });
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch {
              // Ignorer les erreurs de parsing JSON pour les lignes vides
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      // Rollback - retirer le message utilisateur et le message assistant en streaming
      setMessages((prev) =>
        prev.filter(
          (m) =>
            !(m.role === "user" && m.content === content && !m.id) &&
            !m.isStreaming,
        ),
      );
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const welcomeMessage = `Salut ! Je suis ton assistant IA pour t'aider avec cette lecon sur "${context.lessonTitle}".

Pose-moi tes questions ! Je ne te donnerai pas directement les reponses, mais je t'aiderai a comprendre par toi-meme.`;

  // Floating button when closed
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg hover:from-violet-600 hover:to-purple-700 hover:scale-105 transition-transform",
          className,
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>
    );
  }

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 px-4 py-3 shadow-lg hover:from-violet-600 hover:to-purple-700"
        >
          <Sparkles className="h-5 w-5 text-white" />
          <span className="text-white font-medium">Assistant IA</span>
          <Maximize2 className="h-4 w-4 text-white/80" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex h-[500px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Assistant IA</h3>
              <p className="text-[10px] text-white/80">
                {context.subject} - {context.level}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Welcome message */}
            {messages.length === 0 && (
              <>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {welcomeMessage}
                    </p>
                  </div>
                </div>

                {/* Quick prompts */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Suggestions :</p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt.label}
                        onClick={() => sendMessage(prompt.prompt)}
                        className="flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
                      >
                        <prompt.icon className="h-3 w-3" />
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-violet-500 to-purple-600"
                      : "bg-emerald-500",
                  )}
                >
                  {message.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "assistant"
                      ? "rounded-tl-none bg-gray-100 text-gray-700"
                      : "rounded-tr-none bg-emerald-500 text-white",
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-0.5 bg-violet-500 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading - only show when loading but no streaming message yet */}
            {isLoading && !messages.some((m) => m.isStreaming) && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                    <span className="text-sm text-gray-500">
                      Je reflechis...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question..."
              className="min-h-[44px] max-h-[100px] resize-none text-sm"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="h-11 w-11 shrink-0 bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            L&apos;IA te guide sans donner les reponses directement
          </p>
        </div>
      </div>
    </div>
  );
}
