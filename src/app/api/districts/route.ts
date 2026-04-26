import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const sortBy = searchParams.get("sortBy") || "stressScore";
    const order = searchParams.get("order") || "desc";

    const where = region ? { region } : {};

    const districts = await prisma.district.findMany({
      where,
      orderBy: { [sortBy]: order as "asc" | "desc" },
      select: {
        id: true,
        name: true,
        region: true,
        stressScore: true,
        waterStress: true,
        rainfallDeviation: true,
        primaryCrop: true,
        latitude: true,
        longitude: true,
        _count: { select: { talukas: true } },
      },
    });

    return NextResponse.json(districts, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Districts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 });
  }
}
