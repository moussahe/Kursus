"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Extend Window interface for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// Check for browser support
function getSpeechRecognition(): (new () => SpeechRecognition) | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  return SpeechRecognitionAPI || null;
}

/**
 * Custom hook for voice input using Web Speech API
 * Designed for French language by default (fr-FR) for Kursus
 *
 * @example
 * ```tsx
 * const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceInput({
 *   onResult: (text, isFinal) => {
 *     if (isFinal) setInput(text);
 *   }
 * });
 * ```
 */
export function useVoiceInput(
  options: UseVoiceInputOptions = {},
): UseVoiceInputReturn {
  const {
    language = "fr-FR", // French by default for Kursus
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  // Check support synchronously during render (safe for SSR)
  const isSupported = typeof window !== "undefined" && !!getSpeechRecognition();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  // Initialize recognition instance
  const initializeRecognition = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) {
      setError(
        "La reconnaissance vocale n'est pas supportee par votre navigateur",
      );
      return null;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += text;
        } else {
          currentInterim += text;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        setInterimTranscript("");
        onResult?.(finalTranscript, true);
      } else if (currentInterim) {
        setInterimTranscript(currentInterim);
        onResult?.(currentInterim, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "Une erreur est survenue";

      switch (event.error) {
        case "not-allowed":
          errorMessage =
            "L'acces au microphone a ete refuse. Veuillez autoriser l'acces dans les parametres de votre navigateur.";
          break;
        case "no-speech":
          errorMessage =
            "Aucune parole detectee. Essayez de parler plus pres du microphone.";
          break;
        case "audio-capture":
          errorMessage =
            "Aucun microphone detecte. Verifiez que votre microphone est connecte.";
          break;
        case "network":
          errorMessage = "Erreur reseau. Verifiez votre connexion internet.";
          break;
        case "aborted":
          // User cancelled, not an error
          errorMessage = "";
          break;
        default:
          errorMessage = `Erreur: ${event.error}`;
      }

      if (errorMessage) {
        setError(errorMessage);
        onError?.(errorMessage);
      }

      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;

      // Auto-restart if continuous mode and still supposed to be listening
      if (continuous && isListeningRef.current) {
        recognition.start();
      }
    };

    return recognition;
  }, [continuous, interimResults, language, onResult, onError]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = initializeRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      // Already started or other error
      if (err instanceof Error && err.message.includes("already started")) {
        return;
      }
      setError("Impossible de demarrer la reconnaissance vocale");
      onError?.("Impossible de demarrer la reconnaissance vocale");
    }
  }, [initializeRecognition, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
