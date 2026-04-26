import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7"; // days

    const district = await prisma.district.findUnique({
      where: { id },
      select: { name: true, stressScore: true, waterStress: true, rainfallDeviation: true },
    });

    if (!district) {
      return NextResponse.json({ error: "District not found" }, { status: 404 });
    }

    // Generate historical trend data (simulated based on current values)
    const days = parseInt(period);
    const trends = Array.from({ length: days }, (_, i) => {
      const daysAgo = days - i;
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);

      // Simulate variation around current values
      const variation = (Math.random() - 0.5) * 10;
      return {
        date: date.toISOString().split("T")[0],
        stressScore: Math.max(0, Math.min(100, district.stressScore + variation)),
        waterStress: Math.max(0, Math.min(100, district.waterStress + variation * 0.8)),
        rainfallDeviation: district.rainfallDeviation + variation * 0.5,
        alertCount: Math.floor(Math.random() * 5),
        policiesCreated: Math.floor(Math.random() * 3),
      };
    });

    // Alert count by type
    const alertsByType = await prisma.alert.groupBy({
      by: ["type"],
      where: { districtId: id },
      _count: { id: true },
    });

    // Policy status breakdown
    const policiesByStatus = await prisma.policy.groupBy({
      by: ["status"],
      where: { districtId: id },
      _count: { id: true },
    });

    return NextResponse.json({
      district: district.name,
      period: days,
      trends,
      alertsByType: alertsByType.map((a) => ({ type: a.type, count: a._count.id })),
      policiesByStatus: policiesByStatus.map((p) => ({ status: p.status, count: p._count.id })),
    });
  } catch (error) {
    console.error("District analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
