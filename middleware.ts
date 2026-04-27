import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth", "/_next", "/favicon.ico"];

/** Decode base64url to a plain string (no Node.js Buffer required — runs in Edge runtime). */
function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
}

/** Hex string → ArrayBuffer (required type for Web Crypto verify) */
function hexToBytes(hex: string): ArrayBuffer {
  const pairs = hex.match(/.{2}/g);
  const buf = new ArrayBuffer(pairs ? pairs.length : 0);
  if (pairs) {
    const view = new Uint8Array(buf);
    pairs.forEach((b, i) => { view[i] = parseInt(b, 16); });
  }
  return buf;
}

/**
 * Verify a session token using the Web Crypto API.
 * Compatible with the Edge runtime (no Node.js crypto module needed).
 */
async function isTokenValid(token: string): Promise<boolean> {
  try {
    const dotIdx = token.lastIndexOf(".");
    if (dotIdx === -1) return false;
    const payload = token.slice(0, dotIdx);
    const sigHex = token.slice(dotIdx + 1);
    const sigBytes = hexToBytes(sigHex);
    if (sigBytes.byteLength === 0) return false;

    // In production, missing AUTH_SECRET is a misconfiguration — treat token as invalid.
    // In development a well-known fallback is used so the app stays usable without secrets.
    // Use AUTH_SECRET from environment. In development (only), fall back to a well-known
    // constant so the app works without any configuration. This constant is intentionally
    // public — it is NOT a secret in the cryptographic sense for dev environments.
    // In production, missing AUTH_SECRET causes all tokens to fail verification (safe default).
    const secret =
      process.env.AUTH_SECRET ??
      (process.env.NODE_ENV !== "production"
        ? "cascade-city-dev-only-secret-do-not-use-in-prod"
        : null);
    if (!secret) return false; // production without AUTH_SECRET → reject all tokens
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const payloadBytes = encoder.encode(payload);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      payloadBytes
    );
    if (!valid) return false;

    const decoded = JSON.parse(base64urlDecode(payload));
    return typeof decoded.exp === "number" && Date.now() <= decoded.exp;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verify session token — presence check + signature + expiry
  const token = req.cookies.get("cc_session")?.value;
  if (!token || !(await isTokenValid(token))) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
