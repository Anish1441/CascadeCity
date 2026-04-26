import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const deliveries = await prisma.alertDelivery.findMany({
      where: { alertId: id },
      include: {
        farmer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: deliveries.length,
      delivered: deliveries.filter((d) => d.status === "delivered").length,
      failed: deliveries.filter((d) => d.status === "failed").length,
      pending: deliveries.filter((d) => d.status === "pending").length,
    };

    return NextResponse.json({ deliveries, stats });
  } catch (error) {
    console.error("Alert deliveries error:", error);
    return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
  }
}
