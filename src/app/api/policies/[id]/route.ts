import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { policyUpdateSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const policy = await prisma.policy.findUnique({
      where: { id },
      include: {
        district: { select: { name: true } },
        createdBy: { select: { name: true, role: true } },
        comments: {
          include: { user: { select: { name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!policy) return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    return NextResponse.json(policy);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch policy" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const data = policyUpdateSchema.parse(body);

    const policy = await prisma.policy.update({
      where: { id },
      data,
      include: { district: { select: { name: true } } },
    });

    return NextResponse.json(policy);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "lawmaker"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.policy.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete policy" }, { status: 500 });
  }
}
