import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory rate limiting (for production, use Redis/Upstash)
const rateLimitMap = new Map<
  string,
  { count: number; lastReset: number; blocked: boolean }
>();

// Rate limit configurations per route pattern
const RATE_LIMITS: Record<string, { requests: number; windowMs: number }> = {
  // Auth endpoints - stricter limits
  "/api/auth/register": { requests: 5, windowMs: 60 * 1000 }, // 5/min
  "/api/auth/forgot-password": { requests: 3, windowMs: 60 * 1000 }, // 3/min
  "/api/auth/reset-password": { requests: 5, windowMs: 60 * 1000 }, // 5/min

  // AI endpoints - expensive operations
  "/api/ai/chat": { requests: 30, windowMs: 60 * 1000 }, // 30/min
  "/api/ai/course-builder": { requests: 10, windowMs: 60 * 1000 }, // 10/min
  "/api/ai/insights": { requests: 20, windowMs: 60 * 1000 }, // 20/min
  "/api/ai/learning-path": { requests: 10, windowMs: 60 * 1000 }, // 10/min
  "/api/exercises/generate": { requests: 15, windowMs: 60 * 1000 }, // 15/min
  "/api/quizzes/adaptive": { requests: 20, windowMs: 60 * 1000 }, // 20/min

  // Default for other API routes
  default: { requests: 100, windowMs: 60 * 1000 }, // 100/min
};

function getRateLimitConfig(pathname: string) {
  // Check for specific route match
  for (const [pattern, config] of Object.entries(RATE_LIMITS)) {
    if (pattern !== "default" && pathname.startsWith(pattern)) {
      return config;
    }
  }
  return RATE_LIMITS.default;
}

function getClientIP(request: NextRequest): string {
  // Check various headers for real IP (behind proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback - in Next.js 15+ request.ip is not directly available
  // Return a default IP for local development
  return "127.0.0.1";
}

function checkRateLimit(
  ip: string,
  pathname: string,
): { allowed: boolean; remaining: number; resetTime: number } {
  const config = getRateLimitConfig(pathname);
  const key = `${ip}:${pathname}`;
  const now = Date.now();

  let entry = rateLimitMap.get(key);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    const expiredTime = now - 5 * 60 * 1000; // 5 min old
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.lastReset < expiredTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!entry || now - entry.lastReset > config.windowMs) {
    // Reset window
    entry = { count: 1, lastReset: now, blocked: false };
    rateLimitMap.set(key, entry);
    return {
      allowed: true,
      remaining: config.requests - 1,
      resetTime: now + config.windowMs,
    };
  }

  entry.count++;

  if (entry.count > config.requests) {
    entry.blocked = true;
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.lastReset + config.windowMs,
    };
  }

  return {
    allowed: true,
    remaining: config.requests - entry.count,
    resetTime: entry.lastReset + config.windowMs,
  };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only rate limit API routes
  if (pathname.startsWith("/api")) {
    // Skip health check
    if (pathname === "/api/health") {
      return NextResponse.next();
    }

    const ip = getClientIP(request);
    const { allowed, remaining, resetTime } = checkRateLimit(ip, pathname);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Trop de requetes. Veuillez reessayer plus tard.",
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit":
              getRateLimitConfig(pathname).requests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": resetTime.toString(),
            "Retry-After": Math.ceil(
              (resetTime - Date.now()) / 1000,
            ).toString(),
          },
        },
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set(
      "X-RateLimit-Limit",
      getRateLimitConfig(pathname).requests.toString(),
    );
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetTime.toString());

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match API routes
    "/api/:path*",
    // Match auth pages for potential future protection
    // '/(auth)/:path*',
  ],
};
