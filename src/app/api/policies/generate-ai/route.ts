import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePolicyRecommendation } from "@/lib/groq";
import { z } from "zod";

const schema = z.object({
  districtId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!["admin", "lawmaker"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { districtId } = schema.parse(body);

    const district = await prisma.district.findUnique({
      where: { id: districtId },
      select: {
        name: true,
        stressScore: true,
        waterStress: true,
        rainfallDeviation: true,
        primaryCrop: true,
      },
    });

    if (!district) return NextResponse.json({ error: "District not found" }, { status: 404 });

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "gsk_demo_key") {
      // Return demo recommendations
      return NextResponse.json([
        {
          title: "Emergency Water Conservation Program",
          description: `Implement immediate water rationing and drip irrigation subsidies for ${district.primaryCrop} farmers in ${district.name}. Focus on watershed management and groundwater recharge.`,
          impact: "Reduce water stress by 25% within 3 months, benefiting approximately 45,000 farmers",
          benefitScore: 88,
          costScore: 45,
          feasibilityScore: 78,
        },
        {
          title: "Heat-Resistant Crop Variety Distribution",
          description: `Distribute certified heat-tolerant ${district.primaryCrop} seeds through KVK centers. Organize training camps on heat stress management techniques.`,
          impact: "Protect crop yield by 30%, reducing farmer income loss by ₹2,400 crore",
          benefitScore: 82,
          costScore: 38,
          feasibilityScore: 85,
        },
        {
          title: "Crop Insurance Claim Fast-Track",
          description: "Expedite PMFBY insurance claims for drought-affected farmers. Set up dedicated helpdesks in each taluka for claim processing within 7 days.",
          impact: "Provide immediate financial relief to 1.2 lakh affected farmers",
          benefitScore: 91,
          costScore: 25,
          feasibilityScore: 72,
        },
      ]);
    }

    const recommendations = await generatePolicyRecommendation({
      districtName: district.name,
      stressScore: district.stressScore,
      waterStress: district.waterStress,
      rainfallDeviation: district.rainfallDeviation,
      primaryCrop: district.primaryCrop,
    });

    let parsed;
    try {
      // Extract JSON from response
      const jsonMatch = recommendations.match(/\[[\s\S]*\]/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      parsed = [];
    }

    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Generate AI policy error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
