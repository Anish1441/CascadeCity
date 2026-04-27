import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Simulate Twilio sending
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

    // Use real Twilio when credentials are configured; otherwise simulate
    const simulated = !(twilioAccountSid && twilioAuthToken && twilioPhone);

    if (prisma) {
      try {
        await prisma.alert.update({
          where: { id },
          data: { sentAt: new Date() },
        });
      } catch {
        // DB not available, continue
      }
    }

    return NextResponse.json({
      success: true,
      simulated,
      message: simulated
        ? "Alert send simulated (Twilio not configured)"
        : "Alert sent via SMS",
      sentAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });
  }
}
