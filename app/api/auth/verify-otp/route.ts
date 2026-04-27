import { NextRequest, NextResponse } from "next/server";
import {
  verifyOTP,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone: unknown = body?.phone;
    const otp: unknown = body?.otp;

    if (!phone || typeof phone !== "string" || !otp || typeof otp !== "string") {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }

    const normalized = phone.trim().replace(/\s+/g, "");
    const code = otp.trim();

    if (!verifyOTP(normalized, code)) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    const token = createSessionToken(normalized);
    const res = NextResponse.json({ success: true, phone: normalized });
    res.cookies.set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
    return res;
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
