import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const phone: unknown = body?.phone;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const normalized = phone.trim().replace(/\s+/g, "");
    if (!/^\+?[1-9]\d{9,14}$/.test(normalized)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const otp = generateOTP();
    storeOTP(normalized, otp);

    // Use real Twilio when credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && from) {
      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(accountSid, authToken);
        await client.messages.create({
          body: `Your CascadeCity OTP is: ${otp}. Valid for 10 minutes. Do not share.`,
          from,
          to: normalized,
        });
        return NextResponse.json({ success: true, delivered: true });
      } catch {
        // Twilio failed — fall through to dev/mock mode
      }
    }

    // Dev/demo mode: return OTP in response (never in production with real SECRET)
    console.log(`[CascadeCity OTP] ${normalized}: ${otp}`);
    return NextResponse.json({
      success: true,
      delivered: false,
      ...(process.env.NODE_ENV !== "production" && { devOtp: otp }),
    });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
