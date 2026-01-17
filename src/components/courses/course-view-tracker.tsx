"use client";

import { useEffect, useRef } from "react";

interface CourseViewTrackerProps {
  courseId: string;
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  const key = "kursus_session_id";
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "desktop";

  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
}

function getUTMParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
  };
}

export function CourseViewTracker({ courseId }: CourseViewTrackerProps) {
  const hasTracked = useRef(false);
  const startTime = useRef<number>(0);
  const maxScrollDepth = useRef(0);

  useEffect(() => {
    // Prevent double tracking
    if (hasTracked.current) return;
    hasTracked.current = true;
    startTime.current = Date.now();

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const currentDepth = Math.round((window.scrollY / scrollHeight) * 100);
        if (currentDepth > maxScrollDepth.current) {
          maxScrollDepth.current = currentDepth;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Track initial view
    const sessionId = getOrCreateSessionId();
    const deviceType = getDeviceType();
    const utmParams = getUTMParams();

    fetch(`/api/courses/${courseId}/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        referrer: document.referrer || undefined,
        deviceType,
        ...utmParams,
      }),
    }).catch((err) => {
      // Silently fail - view tracking should not break the page
      console.warn("[CourseViewTracker] Failed to track view:", err);
    });

    // Track engagement on page leave
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);

      // Use sendBeacon for reliable tracking on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `/api/courses/${courseId}/views`,
          JSON.stringify({
            sessionId,
            deviceType,
            duration,
            scrollDepth: maxScrollDepth.current,
            ...utmParams,
          }),
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [courseId]);

  // This component doesn't render anything visible
  return null;
}
