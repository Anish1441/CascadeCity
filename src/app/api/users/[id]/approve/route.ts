import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const user = await prisma.user.update({
      where: { id },
      data: { status: "active" },
    });

    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ error: "Failed to approve user" }, { status: 500 });
  }
}
