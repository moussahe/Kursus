"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileText,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CourseAIAssistantProps {
  courseId: string;
}

const QUICK_ACTIONS = [
  {
    id: "lesson-idea",
    label: "Idee de lecon",
    icon: BookOpen,
    prompt:
      "Propose-moi une idee de lecon engageante pour ce cours avec un plan detaille.",
  },
  {
    id: "quiz-questions",
    label: "Quiz",
    icon: HelpCircle,
    prompt:
      "Genere 5 questions de quiz avec leurs réponses et explications pour ce cours.",
  },
  {
    id: "improve-content",
    label: "Ameliorations",
    icon: Lightbulb,
    prompt:
      "Analyse mon cours et suggere des ameliorations concretes pour augmenter l'engagement des élèves.",
  },
  {
    id: "exercise-ideas",
    label: "Exercices",
    icon: FileText,
    prompt:
      "Propose 3 exercices pratiques avec leurs solutions pour renforcer l'apprentissage.",
  },
];

export function CourseAIAssistant({ courseId }: CourseAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message to AI
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || isLoading) return;

      setError(null);
      setIsLoading(true);

      // Add user message
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: messageText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      try {
        const response = await fetch(
          `/api/teacher/courses/${courseId}/ai-assistant`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: messageText,
              conversationHistory: messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
            }),
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erreur lors de la communication");
        }

        const data = await response.json();

        // Add assistant message
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [courseId, messages, isLoading],
  );

  // Handle form submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage(input);
    },
    [input, sendMessage],
  );

  // Handle quick action click
  const handleQuickAction = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage],
  );

  // Handle copy message
  const handleCopy = useCallback(async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input);
      }
    },
    [input, sendMessage],
  );

  // Clear conversation
  const handleClear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return (
    <Card className="rounded-2xl border-0 bg-white shadow-sm h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Assistant IA</h3>
            <p className="text-xs text-gray-500">
              Aide a la creation de contenu
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        )}
      </div>

      {/* Messages area */}
      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 mb-4">
              <Sparkles className="h-8 w-8 text-violet-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              Comment puis-je vous aider ?
            </h4>
            <p className="mt-2 text-sm text-gray-500 max-w-md">
              Je suis votre assistant pedagogique. Je peux vous aider a creer
              des leçons, generer des quiz, et ameliorer votre cours.
            </p>

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-md">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.prompt)}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-violet-300 hover:bg-violet-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                    <action.icon className="h-4 w-4 text-violet-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}

                <div
                  className={cn(
                    "group relative max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-900",
                  )}
                >
                  <div
                    className={cn(
                      "text-sm whitespace-pre-wrap",
                      message.role === "assistant" && "prose-content",
                    )}
                  >
                    {message.content}
                  </div>

                  {/* Copy button for assistant messages */}
                  {message.role === "assistant" && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
                      title="Copier"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                  <span className="text-sm text-gray-500">
                    Generation en cours...
                  </span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>

      {/* Input area */}
      <div className="border-t border-gray-100 p-4">
        {/* Quick actions when in conversation */}
        {messages.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_ACTIONS.map((action) => (
              <Badge
                key={action.id}
                variant="outline"
                className="cursor-pointer hover:bg-violet-50 hover:border-violet-300 transition-colors"
                onClick={() => handleQuickAction(action.prompt)}
              >
                <action.icon className="h-3 w-3 mr-1" />
                {action.label}
              </Badge>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question ou demandez du contenu..."
            className="min-h-[44px] max-h-[120px] resize-none rounded-xl border-gray-200 focus:border-violet-300 focus:ring-violet-200"
            disabled={isLoading}
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 shrink-0 rounded-xl bg-violet-600 hover:bg-violet-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <p className="mt-2 text-xs text-gray-400 text-center">
          Appuyez sur Entree pour envoyer, Maj+Entree pour un retour a la ligne
        </p>
      </div>
    </Card>
  );
}
