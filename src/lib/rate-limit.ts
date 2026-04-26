import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, RateLimitStore>();

export function rateLimit(
  req: NextRequest,
  { limit = 10, window = 60 }: { limit?: number; window?: number } = {}
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const key = `${ip}:${req.nextUrl.pathname}`;
  const now = Date.now();

  const store = rateLimitMap.get(key);

  if (!store || now > store.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + window * 1000 });
    return null;
  }

  if (store.count >= limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((store.resetTime - now) / 1000)),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  store.count++;
  return null;
}

export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
