"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceOutputOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceName?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

interface UseVoiceOutputReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  currentVoice: SpeechSynthesisVoice | null;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
}

/**
 * Custom hook for text-to-speech using Web Speech Synthesis API
 * Designed for French language by default (fr-FR) for Kursus
 *
 * Perfect for:
 * - Younger students (CP-CE2) who can't read well yet
 * - Dyslexic students who benefit from audio
 * - General accessibility
 *
 * @example
 * ```tsx
 * const { speak, stop, isSpeaking, isSupported } = useVoiceOutput({
 *   rate: 0.9, // Slower for young learners
 *   onEnd: () => console.log('Done speaking')
 * });
 *
 * // Speak AI response
 * speak("Bonjour! Je suis ton tuteur IA.");
 * ```
 */
export function useVoiceOutput(
  options: UseVoiceOutputOptions = {},
): UseVoiceOutputReturn {
  const {
    language = "fr-FR", // French by default for Kursus
    rate = 0.95, // Slightly slower for better comprehension
    pitch = 1.0,
    volume = 1.0,
    voiceName,
    onStart,
    onEnd,
    onError,
  } = options;

  // Check support
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(
    null,
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentRateRef = useRef(rate);
  const currentPitchRef = useRef(pitch);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Try to find a French voice
      if (!currentVoice) {
        // Priority: 1. Exact voice name match, 2. fr-FR voice, 3. Any fr voice
        let selectedVoice: SpeechSynthesisVoice | null = null;

        if (voiceName) {
          selectedVoice =
            availableVoices.find((v) => v.name === voiceName) || null;
        }

        if (!selectedVoice) {
          // Look for French voices, preferring natural/premium ones
          const frenchVoices = availableVoices.filter(
            (v) => v.lang === "fr-FR" || v.lang.startsWith("fr"),
          );

          // Prefer voices with "natural" or "premium" in name, or local voices
          selectedVoice =
            frenchVoices.find(
              (v) =>
                v.name.toLowerCase().includes("natural") ||
                v.name.toLowerCase().includes("premium") ||
                v.localService,
            ) ||
            frenchVoices[0] ||
            null;
        }

        if (selectedVoice) {
          setCurrentVoice(selectedVoice);
        }
      }
    };

    // Load voices (may be async on some browsers)
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, voiceName, currentVoice]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        onError?.(
          "La synthese vocale n'est pas supportee par votre navigateur",
        );
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Clean up text for better speech
      const cleanedText = cleanTextForSpeech(text);

      if (!cleanedText.trim()) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = language;
      utterance.rate = currentRateRef.current;
      utterance.pitch = currentPitchRef.current;
      utterance.volume = volume;

      if (currentVoice) {
        utterance.voice = currentVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        onStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        onEnd?.();
      };

      utterance.onerror = (event) => {
        // Ignore 'interrupted' errors (happens when we cancel)
        if (event.error === "interrupted") {
          return;
        }

        let errorMessage = "Erreur de synthese vocale";

        switch (event.error) {
          case "not-allowed":
            errorMessage =
              "La synthese vocale n'est pas autorisee. Verifiez les permissions de votre navigateur.";
            break;
          case "network":
            errorMessage =
              "Erreur reseau. Une connexion internet est requise pour certaines voix.";
            break;
          case "synthesis-unavailable":
            errorMessage =
              "Le service de synthese vocale n'est pas disponible actuellement.";
            break;
          case "canceled":
            // User cancelled, not an error
            return;
          default:
            errorMessage = `Erreur: ${event.error}`;
        }

        setIsSpeaking(false);
        setIsPaused(false);
        onError?.(errorMessage);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, language, volume, currentVoice, onStart, onEnd, onError],
  );

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  const setRate = useCallback((newRate: number) => {
    currentRateRef.current = Math.max(0.1, Math.min(2, newRate));
  }, []);

  const setPitch = useCallback((newPitch: number) => {
    currentPitchRef.current = Math.max(0, Math.min(2, newPitch));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    isSpeaking,
    isPaused,
    isSupported,
    voices,
    currentVoice,
    speak,
    pause,
    resume,
    stop,
    setVoice,
    setRate,
    setPitch,
  };
}

/**
 * Clean text for better speech synthesis
 * - Removes markdown formatting
 * - Converts code blocks to speech-friendly text
 * - Handles emojis and special characters
 */
function cleanTextForSpeech(text: string): string {
  let cleaned = text;

  // Remove code blocks (```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, "Bloc de code omis.");

  // Remove inline code (`...`)
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");

  // Remove markdown bold/italic (**text**, *text*, __text__, _text_)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");

  // Remove markdown headers (# Header)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");

  // Remove markdown links [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove markdown images ![alt](url)
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, "Image: $1");

  // Remove bullet points and numbered lists formatting
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, "");
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, "");

  // Convert common math symbols to spoken form
  cleaned = cleaned.replace(/\+/g, " plus ");
  cleaned = cleaned.replace(/\-/g, " moins ");
  cleaned = cleaned.replace(/\*/g, " fois ");
  cleaned = cleaned.replace(/\//g, " divise par ");
  cleaned = cleaned.replace(/=/g, " egale ");
  cleaned = cleaned.replace(/</g, " inferieur a ");
  cleaned = cleaned.replace(/>/g, " superieur a ");
  cleaned = cleaned.replace(/≤/g, " inferieur ou egal a ");
  cleaned = cleaned.replace(/≥/g, " superieur ou egal a ");
  cleaned = cleaned.replace(/≠/g, " different de ");

  // Remove URLs
  cleaned = cleaned.replace(/https?:\/\/\S+/g, "lien internet");

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/\s+/g, " ");

  // Trim
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Get available French voices for Kursus
 */
export function getFrenchVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }

  return window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang === "fr-FR" || v.lang.startsWith("fr"));
}
