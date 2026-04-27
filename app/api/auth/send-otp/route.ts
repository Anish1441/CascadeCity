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
        // Only store OTP after successful SMS delivery
        storeOTP(normalized, otp);
        return NextResponse.json({ success: true, delivered: true });
      } catch {
        // Twilio failed — fall through
      }
    }

    // In production, require Twilio to be configured — OTP is NOT stored
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "SMS service not configured. Please contact your system administrator." },
        { status: 503 }
      );
    }

    // Development only: store OTP and return it so developers can test without Twilio
    storeOTP(normalized, otp);
    return NextResponse.json({
      success: true,
      delivered: false,
      devOtp: otp,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
