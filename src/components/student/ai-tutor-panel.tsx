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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useVoiceOutput } from "@/hooks/use-voice-output";
import { HomeworkPhotoUpload } from "@/components/ai/homework-photo-upload";

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

  // Voice input hook
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

  // Voice output (TTS) hook
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(
    null,
  );
  const {
    isSpeaking,
    isSupported: isTTSSupported,
    speak,
    stop: stopSpeaking,
  } = useVoiceOutput({
    language: "fr-FR",
    rate: 0.95,
    onStart: () => {},
    onEnd: () => setCurrentlySpeakingId(null),
    onError: () => setCurrentlySpeakingId(null),
  });

  // Handle speaking a message
  const handleSpeak = useCallback(
    (messageId: string | undefined, content: string) => {
      if (!messageId) return;

      if (isSpeaking && currentlySpeakingId === messageId) {
        stopSpeaking();
        setCurrentlySpeakingId(null);
      } else {
        stopSpeaking();
        setCurrentlySpeakingId(messageId);
        speak(content);
      }
    },
    [isSpeaking, currentlySpeakingId, speak, stopSpeaking],
  );

  // Auto-speak new AI responses if voice output is enabled
  useEffect(() => {
    if (!voiceOutputEnabled || !isTTSSupported) return;

    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.role === "assistant" &&
      lastMessage.id &&
      !lastMessage.isStreaming &&
      !isSpeaking
    ) {
      setCurrentlySpeakingId(lastMessage.id);
      speak(lastMessage.content);
    }
  }, [messages, voiceOutputEnabled, isTTSSupported, isSpeaking, speak]);

  // Handle voice toggle
  const handleVoiceToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

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
    } catch {
      setError(
        "Impossible de demarrer une nouvelle conversation. Veuillez reessayer.",
      );
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

Pose-moi tes questions ! Je ne te donnerai pas directement les réponses, mais je t'aiderai a comprendre par toi-meme.${isVoiceSupported ? "\n\n🎤 Tu peux aussi me parler en cliquant sur le micro !" : ""}`;

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
            {/* Voice output toggle */}
            {isTTSSupported && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (isSpeaking) stopSpeaking();
                        setVoiceOutputEnabled(!voiceOutputEnabled);
                      }}
                      className={cn(
                        "h-8 w-8",
                        voiceOutputEnabled
                          ? "bg-white/30 text-white hover:bg-white/40"
                          : "text-white/80 hover:text-white hover:bg-white/20",
                      )}
                    >
                      {voiceOutputEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>
                      {voiceOutputEnabled
                        ? "Desactiver la lecture vocale"
                        : "Activer la lecture vocale"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
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
                <div className="flex flex-col gap-1">
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
                  {/* Speaker button for AI messages */}
                  {message.role === "assistant" &&
                    isTTSSupported &&
                    !message.isStreaming && (
                      <button
                        onClick={() => handleSpeak(message.id, message.content)}
                        className={cn(
                          "flex items-center gap-1.5 self-start rounded-full px-2 py-1 text-xs transition-all",
                          currentlySpeakingId === message.id && isSpeaking
                            ? "bg-violet-100 text-violet-700"
                            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600",
                        )}
                      >
                        {currentlySpeakingId === message.id && isSpeaking ? (
                          <>
                            <Square className="h-3 w-3 fill-current" />
                            <span>Arreter</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>Ecouter</span>
                          </>
                        )}
                      </button>
                    )}
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
          <div className="flex flex-col gap-2">
            {/* Voice error message */}
            {voiceError && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {voiceError}
              </div>
            )}

            {/* Voice listening indicator */}
            {isListening && (
              <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2">
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-500" />
                </div>
                <span className="text-xs font-medium text-violet-700">
                  Parle maintenant...
                </span>
                {interimTranscript && (
                  <span className="ml-2 text-xs italic text-violet-600 truncate">
                    &ldquo;{interimTranscript}&rdquo;
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              {/* Photo upload button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HomeworkPhotoUpload
                      context={{
                        level: context.level,
                        subject: context.subject,
                        courseTitle: context.courseTitle,
                        lessonTitle: context.lessonTitle,
                      }}
                      disabled={isLoading}
                      onPhotoAnalyzed={(response) => {
                        // Add the AI response as a message
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: `photo-response-${Date.now()}`,
                            role: "assistant" as const,
                            content: response,
                          },
                        ]);
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Photo de devoir</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Voice input button */}
              {isVoiceSupported && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={handleVoiceToggle}
                        disabled={isLoading}
                        size="icon"
                        variant={isListening ? "default" : "outline"}
                        className={cn(
                          "h-11 w-11 shrink-0 transition-all",
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
                    <TooltipContent side="top">
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
                  "min-h-[44px] max-h-[100px] resize-none text-sm",
                  isListening && "border-violet-300 bg-violet-50/50",
                )}
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || isListening}
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
          </div>
          <p className="mt-2 text-center text-[10px] text-gray-400">
            L&apos;IA te guide sans donner les réponses directement
          </p>
        </div>
      </div>
    </div>
  );
}
