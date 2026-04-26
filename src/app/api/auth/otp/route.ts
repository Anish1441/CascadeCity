import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/utils";
import { sendOTPSMS, sendOTPWhatsApp, isTwilioConfigured } from "@/lib/twilio";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, "Invalid phone format"),
  channel: z.enum(["sms", "whatsapp"]).default("sms"),
  name: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 5 requests per minute per IP
  const limited = rateLimit(req, { limit: 5, window: 60 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { phone, channel, name } = schema.parse(body);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert user
    await prisma.user.upsert({
      where: { phone },
      update: { otp, otpExpiry },
      create: {
        phone,
        name: name || "User",
        otp,
        otpExpiry,
        role: "farmer",
        status: "pending",
      },
    });

    // Send OTP
    let sent = false;
    let devOtp: string | undefined;

    if (isTwilioConfigured()) {
      if (channel === "whatsapp") {
        sent = await sendOTPWhatsApp(phone, otp);
      } else {
        sent = await sendOTPSMS(phone, otp);
      }
    } else {
      // Development mode: return OTP in response
      devOtp = otp;
      sent = true;
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }

    if (!sent && isTwilioConfigured()) {
      return NextResponse.json({ error: "Failed to send OTP. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent via ${channel} to ${phone}`,
      // Only include in development
      ...(process.env.NODE_ENV === "development" && devOtp ? { devOtp } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("OTP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
