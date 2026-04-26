import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MOCK_POLICIES = [
  {
    id: "policy-1",
    title: "Heat Wave Emergency Response Protocol 2024",
    content: "This protocol outlines the emergency response measures to be taken during heat wave conditions in Maharashtra. District collectors must activate cooling centers, distribute ORS, and coordinate with health departments within 2 hours of IMD heat wave warning.",
    category: "Emergency Response",
    status: "PUBLISHED",
    districtId: null,
    aiGenerated: false,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: "policy-2",
    title: "Farmer Water Credit Scheme - Marathwada",
    content: "Under this scheme, farmers in drought-affected Marathwada districts will receive subsidized water tanker services. Eligible farmers: those with less than 2 hectares of land and declared crop loss. Subsidy: 75% of tanker cost. Application via Aaple Sarkar portal.",
    category: "Water Management",
    status: "APPROVED",
    districtId: "beed",
    aiGenerated: false,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "policy-3",
    title: "Crop Insurance Rapid Settlement - Kharif 2024",
    content: "Fast-track settlement of PMFBY claims for Kharif 2024 losses due to drought and excess rainfall. All district offices must complete survey within 15 days of crop cutting experiment. Insurance companies to settle within 30 days.",
    category: "Crop Insurance",
    status: "PUBLISHED",
    districtId: null,
    aiGenerated: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "policy-4",
    title: "Cotton Bollworm Pest Management Directive",
    content: "AI-generated advisory for combating pink bollworm infestation in Vidarbha cotton belt. Recommended actions: deploy pheromone traps at 5/hectare density, apply spinosad 45% SC at 100ml/acre, conduct mass awareness through Kisan Call Center 1800-180-1551.",
    category: "Pest Management",
    status: "DRAFT",
    districtId: "akola",
    aiGenerated: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export async function GET() {
  if (prisma) {
    try {
      const policies = await prisma.policy.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ data: policies, total: policies.length });
    } catch {
      // fall through to mock
    }
  }
  return NextResponse.json({ data: MOCK_POLICIES, total: MOCK_POLICIES.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category, districtId, status } = body;
    if (!title || !content || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (prisma) {
      try {
        const policy = await prisma.policy.create({
          data: {
            title,
            content,
            category,
            districtId: districtId || null,
            status: status || "DRAFT",
            aiGenerated: false,
          },
        });
        return NextResponse.json({ data: policy }, { status: 201 });
      } catch {
        // fall through to mock
      }
    }
    const newPolicy = {
      id: `policy-${Date.now()}`,
      title,
      content,
      category,
      status: status || "DRAFT",
      districtId: districtId || null,
      aiGenerated: false,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ data: newPolicy }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
