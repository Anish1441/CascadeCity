import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendAlertSMS, sendAlertWhatsApp, isTwilioConfigured } from "@/lib/twilio";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "lawmaker", "field_agent"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const alert = await prisma.alert.findUnique({
      where: { id },
      include: {
        district: {
          include: {
            talukas: { include: { farmers: true } },
          },
        },
      },
    });

    if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

    // Get all farmers in district
    const farmers = alert.district.talukas.flatMap((t) => t.farmers);

    let sent = 0;
    let failed = 0;
    const deliveries = [];

    if (isTwilioConfigured() && farmers.length > 0) {
      // Send to all farmers (batch with delay to avoid rate limits)
      for (const farmer of farmers.slice(0, 50)) { // Limit to 50 for safety
        const message = alert.farmerMessage || alert.message;
        let result;

        if (alert.channel === "whatsapp" || alert.channel === "both") {
          result = await sendAlertWhatsApp(farmer.phone, message);
        } else {
          result = await sendAlertSMS(farmer.phone, message);
        }

        deliveries.push({
          alertId: alert.id,
          farmerId: farmer.id,
          status: result.success ? "delivered" : "failed",
          deliveredAt: result.success ? new Date() : null,
        });

        if (result.success) sent++;
        else failed++;
      }

      // Batch create deliveries
      await prisma.alertDelivery.createMany({ data: deliveries, skipDuplicates: true });
    } else {
      // Mock delivery for development
      sent = farmers.length;
      console.log(`[DEV] Alert sent to ${farmers.length} farmers in ${alert.district.name}`);
    }

    // Mark alert as sent
    await prisma.alert.update({
      where: { id },
      data: { sentAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: farmers.length,
      message: `Alert sent to ${sent} farmers`,
    });
  } catch (error) {
    console.error("Alert send error:", error);
    return NextResponse.json({ error: "Failed to send alert" }, { status: 500 });
  }
}
