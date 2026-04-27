import crypto from "crypto";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Lazily-resolved secret so the module can be imported during build without
// throwing. The error is raised at request-time in production if AUTH_SECRET
// is not set, which is the correct behaviour for a runtime secret.
let _secret: string | undefined;
function getSecret(): string {
  if (_secret) return _secret;
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "AUTH_SECRET environment variable must be set in production. " +
          "Generate one with: openssl rand -hex 32"
      );
    }
    // Development/test fallback — never used in production
    _secret = "cascade-city-dev-only-secret-do-not-use-in-prod";
  } else {
    _secret = secret;
  }
  return _secret;
}

// In-memory OTP store.
// NOTE: In production with multiple instances, replace with Redis (UPSTASH_REDIS_REST_URL)
// to share state across servers. An in-memory store loses OTPs on restart.
const _g = globalThis as Record<string, unknown>;
if (process.env.NODE_ENV === "production" && !process.env.UPSTASH_REDIS_REST_URL && !_g.__otpWarnLogged) {
  _g.__otpWarnLogged = true;
  console.warn(
    "[CascadeCity] WARNING: UPSTASH_REDIS_REST_URL is not set. " +
      "OTPs are stored in-memory and will be lost on server restart. " +
      "Configure Redis for reliable production operation."
  );
}
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export function generateOTP(): string {
  // Use crypto.randomInt for cryptographically secure OTP generation
  return crypto.randomInt(100000, 1000000).toString();
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
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { phone: string } | null {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return null;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);
    const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
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
