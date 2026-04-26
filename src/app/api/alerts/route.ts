import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { alertCreateSchema, paginationSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { page, limit } = paginationSchema.parse(Object.fromEntries(searchParams));
    const districtId = searchParams.get("districtId");
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");

    const where: Record<string, unknown> = {};
    if (districtId) where.districtId = districtId;
    if (type) where.type = type;
    if (severity) where.severity = severity;

    // Field agents and farmers only see their district
    if (session.user.role === "field_agent" && session.user.districtId) {
      where.districtId = session.user.districtId;
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          district: { select: { name: true } },
          _count: { select: { deliveries: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);

    return NextResponse.json({ alerts, total, page, limit });
  } catch (error) {
    console.error("Alerts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "lawmaker", "field_agent"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = alertCreateSchema.parse(body);

    const alert = await prisma.alert.create({
      data: {
        districtId: data.districtId,
        type: data.type,
        severity: data.severity,
        message: data.message,
        farmerMessage: data.farmerMessage,
        officerMessage: data.officerMessage,
        channel: data.channel,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      },
      include: { district: { select: { name: true } } },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Alert POST error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
