import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [
      totalDistricts,
      totalAlerts,
      totalPolicies,
      completedPolicies,
      alertsThisWeek,
      farmersReached,
      districtsByStress,
    ] = await Promise.all([
      prisma.district.count(),
      prisma.alert.count(),
      prisma.policy.count(),
      prisma.policy.count({ where: { status: "completed" } }),
      prisma.alert.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.alertDelivery.count({ where: { status: "delivered" } }),
      prisma.district.findMany({
        select: { name: true, stressScore: true, region: true },
        orderBy: { stressScore: "desc" },
        take: 10,
      }),
    ]);

    // Alert breakdown by type
    const alertsByType = await prisma.alert.groupBy({
      by: ["type"],
      _count: { id: true },
    });

    // Policy breakdown by status
    const policiesByStatus = await prisma.policy.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Top districts needing attention
    const criticalDistricts = districtsByStress.filter((d) => d.stressScore >= 80);

    return NextResponse.json({
      metrics: {
        totalDistricts,
        totalAlerts,
        totalPolicies,
        completionRate:
          totalPolicies > 0 ? Math.round((completedPolicies / totalPolicies) * 100) : 0,
        alertsThisWeek,
        farmersReached,
        criticalDistricts: criticalDistricts.length,
      },
      alertsByType: alertsByType.map((a) => ({ type: a.type, count: a._count.id })),
      policiesByStatus: policiesByStatus.map((p) => ({ status: p.status, count: p._count.id })),
      topDistrictsByStress: districtsByStress,
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
