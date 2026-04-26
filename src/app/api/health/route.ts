import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const start = Date.now();

    // Check DB connection
    let dbStatus = "ok";
    let dbLatency = 0;
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - dbStart;
    } catch {
      dbStatus = "error";
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      latency: Date.now() - start,
      services: {
        database: { status: dbStatus, latency: dbLatency },
        openmeteo: { status: "ok" },
        groq: { status: process.env.GROQ_API_KEY ? "configured" : "not_configured" },
        twilio: { status: process.env.TWILIO_ACCOUNT_SID?.startsWith("AC") ? "configured" : "not_configured" },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: String(error) },
      { status: 500 }
    );
  }
}
