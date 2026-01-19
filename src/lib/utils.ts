import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date range for display (e.g., "12 jan. - 18 jan.")
 */
export function formatWeekRange(weekStart: Date, weekEnd: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  const startStr = weekStart.toLocaleDateString("fr-FR", options);
  const endStr = weekEnd.toLocaleDateString("fr-FR", options);
  return `${startStr} - ${endStr}`;
}

/**
 * Convert video URLs to embed format for iframe display
 * Supports YouTube (various formats) and Vimeo
 */
export function getVideoEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube patterns
  // https://www.youtube.com/watch?v=VIDEO_ID
  // https://youtu.be/VIDEO_ID
  // https://www.youtube.com/embed/VIDEO_ID (already embed format)
  // https://www.youtube.com/v/VIDEO_ID
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  // Vimeo patterns
  // https://vimeo.com/VIDEO_ID
  // https://player.vimeo.com/video/VIDEO_ID (already embed format)
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // If URL is already an embed URL or unrecognized, return as-is
  return url;
}
