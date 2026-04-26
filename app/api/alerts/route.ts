import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MOCK_ALERTS = [
  {
    id: "alert-1",
    title: "Extreme Heat Warning - Vidarbha Region",
    message: "Temperatures expected to exceed 44°C in Nagpur, Wardha, and Yavatmal districts. Farmers advised to avoid field work between 11 AM - 4 PM.",
    type: "WEATHER",
    severity: "CRITICAL",
    districtId: "nagpur",
    isActive: true,
    sentAt: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "alert-2",
    title: "Drought Advisory - Marathwada",
    message: "Below-normal rainfall recorded in Beed, Latur, and Osmanabad. Activate water conservation protocols and distribute fodder to livestock owners.",
    type: "DROUGHT",
    severity: "HIGH",
    districtId: "beed",
    isActive: true,
    sentAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "alert-3",
    title: "Pest Alert - Cotton Bollworm",
    message: "Pink bollworm infestation reported in Akola and Washim. Farmers should inspect fields and contact agricultural officers immediately.",
    type: "PEST",
    severity: "HIGH",
    districtId: "akola",
    isActive: true,
    sentAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: "alert-4",
    title: "Heavy Rainfall Warning - Konkan",
    message: "IMD predicts heavy to very heavy rainfall in Ratnagiri and Sindhudurg. Coastal fishing activities suspended. Evacuate low-lying areas.",
    type: "FLOOD",
    severity: "HIGH",
    districtId: "ratnagiri",
    isActive: true,
    sentAt: null,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "alert-5",
    title: "Market Price Alert - Onion",
    message: "Onion prices dropped 30% in Nashik APMC. Government procurement at MSP will begin Monday. Contact your local Krishi Seva Kendra.",
    type: "MARKET",
    severity: "MEDIUM",
    districtId: "nashik",
    isActive: true,
    sentAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export async function GET() {
  if (prisma) {
    try {
      const alerts = await prisma.alert.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ data: alerts, total: alerts.length });
    } catch {
      // fall through to mock
    }
  }
  return NextResponse.json({ data: MOCK_ALERTS, total: MOCK_ALERTS.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, type, severity, districtId } = body;
    if (!title || !message || !type || !severity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (prisma) {
      try {
        const alert = await prisma.alert.create({
          data: { title, message, type, severity, districtId: districtId || null },
        });
        return NextResponse.json({ data: alert }, { status: 201 });
      } catch {
        // fall through to mock
      }
    }
    const newAlert = {
      id: `alert-${Date.now()}`,
      title,
      message,
      type,
      severity,
      districtId: districtId || null,
      isActive: true,
      sentAt: null,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ data: newAlert }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
