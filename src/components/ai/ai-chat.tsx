"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  History,
  Mic,
  MicOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStreamingMessage } from "@/hooks/use-ai-chat";
import { useVoiceInput } from "@/hooks/use-voice-input";

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
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Hook for streaming messages
  const { streamMessage } = useStreamingMessage();

  // Hook for voice input
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
  } = useVoiceInput({
    language: "fr-FR",
    continuous: false,
    interimResults: true,
    onResult: (text, isFinal) => {
      if (isFinal) {
        setInput((prev) => prev + text);
      }
    },
  });

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
        .catch(() => {
          setError(
            "Impossible de charger la conversation. Vous pouvez en demarrer une nouvelle.",
          );
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
    } catch {
      setError(
        "Impossible de creer une nouvelle conversation. Veuillez reessayer.",
      );
      return null;
    }
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

  // Envoyer un message avec streaming (nouveau mode)
  const sendMessageWithStreaming = async (
    convId: string,
    userContent: string,
  ) => {
    setIsStreaming(true);
    setStreamingContent("");

    // Add user message immediately
    const tempUserMessage: Message = { role: "user", content: userContent };
    setMessages((prev) => [...prev, tempUserMessage]);

    // Track the full content during streaming
    let finalContent = "";

    const result = await streamMessage(convId, userContent, context, {
      onStart: (userMessageId) => {
        // Update user message with real ID
        setMessages((prev) => {
          const updated = [...prev];
          const lastUserIndex = updated.findLastIndex(
            (m) => m.role === "user" && m.content === userContent,
          );
          if (lastUserIndex !== -1) {
            updated[lastUserIndex] = {
              ...updated[lastUserIndex],
              id: userMessageId,
            };
          }
          return updated;
        });
      },
      onText: (_, fullText) => {
        finalContent = fullText;
        setStreamingContent(fullText);
      },
      onComplete: (assistantMessageId) => {
        // Replace streaming content with final message using captured content
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: finalContent,
          },
        ]);
        setStreamingContent("");
        setIsStreaming(false);
      },
      onError: (errorMsg) => {
        setError(errorMsg);
        setIsStreaming(false);
        setStreamingContent("");
      },
    });

    // If streaming completed but callbacks didn't clean up properly
    if (result.success) {
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  // Envoyer un message
  const sendMessage = async () => {
    if (!input.trim() || isLoading || isStreaming) return;

    const userContent = input.trim();
    const userMessage: Message = { role: "user", content: userContent };
    const newMessages = [...messages, userMessage];

    setInput("");
    setError(null);

    try {
      if (persistenceEnabled) {
        // Mode persistence with streaming
        let currentConvId = conversationId;

        // Creer une conversation si necessaire
        if (!currentConvId) {
          setIsLoading(true);
          currentConvId = await createConversation();
          setIsLoading(false);
          if (!currentConvId) {
            throw new Error("Impossible de creer la conversation");
          }
        }

        // Use streaming mode
        await sendMessageWithStreaming(currentConvId, userContent);
      } else {
        // Mode sans persistence (original, non-streaming)
        setMessages(newMessages);
        setIsLoading(true);
        const assistantContent =
          await sendMessageWithoutPersistence(newMessages);
        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantContent },
        ]);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
      // Rollback en cas d'erreur
      setMessages(messages);
      setIsLoading(false);
      setIsStreaming(false);
    } finally {
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

  // Handle voice button click
  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Message d'accueil with voice hint for supported browsers
  const welcomeMessage = `Salut ! 👋 Je suis ton assistant pour t'aider avec ${context.subject}${context.lessonTitle ? ` - "${context.lessonTitle}"` : ""}.

Pose-moi tes questions et je te guiderai vers la solution. Je ne te donnerai pas directement les reponses, mais je t'aiderai a comprendre ! 💡${isVoiceSupported ? "\n\n🎤 Tu peux aussi me parler en cliquant sur le micro !" : ""}`;

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

          {/* Streaming response - shows as AI types */}
          {isStreaming && streamingContent && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-muted px-4 py-3">
                <p className="whitespace-pre-wrap text-sm">
                  {streamingContent}
                </p>
                <span className="inline-block h-4 w-1 animate-pulse bg-violet-500 ml-1" />
              </div>
            </div>
          )}

          {/* Loading indicator - shows before streaming starts */}
          {(isLoading || (isStreaming && !streamingContent)) && (
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
        <div className="flex w-full flex-col gap-2">
          {/* Voice error message */}
          {voiceError && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              {voiceError}
            </div>
          )}

          {/* Voice listening indicator */}
          {isListening && (
            <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-900/20">
              <div className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-500" />
              </div>
              <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                Parle maintenant...
              </span>
              {interimTranscript && (
                <span className="ml-2 text-xs italic text-violet-600 dark:text-violet-400">
                  &ldquo;{interimTranscript}&rdquo;
                </span>
              )}
            </div>
          )}

          <div className="flex w-full gap-2">
            {/* Voice input button */}
            {isVoiceSupported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      onClick={handleVoiceToggle}
                      disabled={isLoading || isStreaming}
                      size="icon"
                      variant={isListening ? "default" : "outline"}
                      className={cn(
                        "h-11 w-11 flex-shrink-0 transition-all",
                        isListening
                          ? "bg-violet-600 hover:bg-violet-700 text-white animate-pulse"
                          : "hover:bg-violet-50 hover:border-violet-300",
                      )}
                    >
                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4 text-violet-600" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {isListening ? "Arreter l'ecoute" : "Parler au micro"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Textarea
              ref={textareaRef}
              value={
                isListening && interimTranscript
                  ? input + interimTranscript
                  : input
              }
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? "Parle maintenant..." : "Pose ta question..."
              }
              className={cn(
                "min-h-[44px] max-h-[120px] resize-none",
                isListening && "border-violet-300 bg-violet-50/50",
              )}
              rows={1}
              disabled={isLoading || isStreaming}
            />
            <Button
              onClick={sendMessage}
              disabled={
                !input.trim() || isLoading || isStreaming || isListening
              }
              size="icon"
              className="h-11 w-11 flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading || isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
