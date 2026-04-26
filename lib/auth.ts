import crypto from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SECRET = process.env.AUTH_SECRET ?? "cascade-city-dev-secret-change-in-prod";

// In-memory OTP store. In production, replace with Redis (UPSTASH_REDIS_REST_URL).
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, code: string): void {
  otpStore.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS });
}

export function verifyOTP(phone: string, code: string): boolean {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(phone); // one-time use
  return true;
}

export function createSessionToken(phone: string): string {
  const payload = Buffer.from(
    JSON.stringify({ phone, exp: Date.now() + SESSION_TTL_MS })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { phone: string } | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
    if (sig !== expected) return null;
    const { phone, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    );
    if (Date.now() > exp) return null;
    return { phone };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "cc_session";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 24 * 60 * 60, // seconds
};
