"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContext {
  level: string;
  subject: string;
  courseTitle?: string;
  lessonTitle?: string;
  lessonContent?: string;
}

interface AIChatProps {
  context: ChatContext;
  childId?: string;
  courseId?: string;
  lessonId?: string;
  conversationId?: string;
  className?: string;
  onClose?: () => void;
  onConversationCreated?: (conversationId: string) => void;
}

export function AIChat({
  context,
  childId,
  courseId,
  lessonId,
  conversationId: initialConversationId,
  className,
  onClose,
  onConversationCreated,
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mode persistence active si childId est fourni
  const persistenceEnabled = !!childId;

  // Auto-scroll vers le bas
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Charger une conversation existante
  useEffect(() => {
    if (initialConversationId && persistenceEnabled) {
      setIsInitializing(true);
      fetch(`/api/ai/conversations/${initialConversationId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) {
            setMessages(
              data.messages.map(
                (m: { id: string; role: string; content: string }) => ({
                  id: m.id,
                  role: m.role.toLowerCase() as "user" | "assistant",
                  content: m.content,
                }),
              ),
            );
          }
        })
        .catch((err) => {
          console.error("Erreur chargement conversation:", err);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [initialConversationId, persistenceEnabled]);

  // Creer une nouvelle conversation
  const createConversation = async (): Promise<string | null> => {
    if (!childId) return null;

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
      onConversationCreated?.(data.id);
      return data.id;
    } catch (err) {
      console.error("Erreur creation conversation:", err);
      return null;
    }
  };

  // Envoyer un message avec persistence
  const sendMessageWithPersistence = async (
    convId: string,
    userContent: string,
  ) => {
    const res = await fetch(`/api/ai/conversations/${convId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: userContent, context }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erreur d'envoi");
    }

    return data;
  };

  // Envoyer un message sans persistence (mode original)
  const sendMessageWithoutPersistence = async (
    allMessages: Message[],
  ): Promise<string> => {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: allMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Une erreur est survenue");
    }

    return data.message;
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const userMessage: Message = { role: "user", content: userContent };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      if (persistenceEnabled) {
        // Mode persistence
        let currentConvId = conversationId;

        // Creer une conversation si necessaire
        if (!currentConvId) {
          currentConvId = await createConversation();
          if (!currentConvId) {
            throw new Error("Impossible de creer la conversation");
          }
        }

        const data = await sendMessageWithPersistence(
          currentConvId,
          userContent,
        );

        setMessages([
          ...messages,
          {
            id: data.userMessage.id,
            role: "user",
            content: data.userMessage.content,
          },
          {
            id: data.assistantMessage.id,
            role: "assistant",
            content: data.assistantMessage.content,
          },
        ]);
      } else {
        // Mode sans persistence (original)
        const assistantContent =
          await sendMessageWithoutPersistence(newMessages);
        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantContent },
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      // Rollback en cas d'erreur
      setMessages(messages);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  // Gerer Enter pour envoyer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Message d'accueil
  const welcomeMessage = `Salut ! 👋 Je suis ton assistant pour t'aider avec ${context.subject}${context.lessonTitle ? ` - "${context.lessonTitle}"` : ""}.

Pose-moi tes questions et je te guiderai vers la solution. Je ne te donnerai pas directement les reponses, mais je t'aiderai a comprendre ! 💡`;

  if (isInitializing) {
    return (
      <Card
        className={cn(
          "flex h-[500px] flex-col items-center justify-center",
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="mt-2 text-sm text-muted-foreground">
          Chargement de la conversation...
        </p>
      </Card>
    );
  }

  return (
    <Card className={cn("flex h-[500px] flex-col", className)}>
      <CardHeader className="flex-shrink-0 border-b py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Assistant IA
            {persistenceEnabled && conversationId && (
              <History className="h-3 w-3 text-muted-foreground" />
            )}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {context.level} • {context.subject}
          {persistenceEnabled && (
            <span className="ml-2 text-violet-500">• Sauvegarde auto</span>
          )}
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Message d'accueil */}
          {messages.length === 0 && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3">
                <p className="whitespace-pre-wrap text-sm">{welcomeMessage}</p>
              </div>
            </div>
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
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                  message.role === "assistant"
                    ? "bg-gradient-to-br from-violet-500 to-purple-600"
                    : "bg-emerald-600",
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
                    ? "rounded-tl-none bg-muted"
                    : "rounded-tr-none bg-emerald-600 text-white",
                )}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Je reflechis...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      <CardFooter className="flex-shrink-0 border-t p-3">
        <div className="flex w-full gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pose ta question..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
