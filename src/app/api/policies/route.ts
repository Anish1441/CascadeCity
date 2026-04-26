import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { policyCreateSchema, policyUpdateSchema, paginationSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const { page, limit } = paginationSchema.parse(Object.fromEntries(searchParams));
    const districtId = searchParams.get("districtId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (districtId) where.districtId = districtId;
    if (status) where.status = status;

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        include: {
          district: { select: { name: true } },
          createdBy: { select: { name: true, role: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.policy.count({ where }),
    ]);

    return NextResponse.json({ policies, total, page, limit });
  } catch (error) {
    console.error("Policies GET error:", error);
    return NextResponse.json({ error: "Failed to fetch policies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "lawmaker"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden - only lawmakers and admins can create policies" }, { status: 403 });
    }

    const body = await req.json();
    const data = policyCreateSchema.parse(body);

    const policy = await prisma.policy.create({
      data: {
        ...data,
        createdById: session.user.id,
      },
      include: {
        district: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Policy POST error:", error);
    return NextResponse.json({ error: "Failed to create policy" }, { status: 500 });
  }
}
