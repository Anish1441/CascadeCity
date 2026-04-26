import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/verify", "/api/auth", "/api/health"];

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: unknown };
  const path = nextUrl.pathname;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // Require auth for dashboard routes
  if (!session && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // API routes: return 401 if not authenticated (except public ones)
  if (!session && path.startsWith("/api/") && !path.startsWith("/api/auth") && !path.startsWith("/api/health")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.open-meteo.com https://api.waqi.info https://tile.openstreetmap.org;"
  );

  return response;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
