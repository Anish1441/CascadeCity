import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const district = await prisma.district.findUnique({
      where: { id },
      include: {
        talukas: {
          orderBy: { stressScore: "desc" },
        },
        _count: {
          select: { policies: true, alerts: true },
        },
      },
    });

    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 });
    }

    return NextResponse.json(district, {
      headers: { "Cache-Control": "public, s-maxage=300" },
    });
  } catch (error) {
    console.error("District GET error:", error);
    return NextResponse.json({ error: "Failed to fetch district" }, { status: 500 });
  }
}
