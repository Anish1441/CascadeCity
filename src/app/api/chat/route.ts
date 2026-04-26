import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateChatResponse } from "@/lib/groq";
import { prisma } from "@/lib/prisma";
import { chatMessageSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

// Knowledge base fallback when Groq is unavailable
const KNOWLEDGE_BASE: Record<string, string> = {
  default:
    "I'm the CascadeCity AI assistant. I can help you with crop management, weather advisories, government schemes, and agricultural best practices in Maharashtra. What would you like to know?",
  pmfby:
    "PMFBY (Pradhan Mantri Fasal Bima Yojana) provides crop insurance at low premiums. Farmers pay 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops. Claims are processed within 30 days of crop damage assessment. Visit your nearest CSC or bank to enroll.",
  heat:
    "During heat stress, irrigate crops in early morning or evening. Apply mulching to retain soil moisture. Consider using shade nets for horticulture crops. Monitor for heat-stressed plant symptoms: leaf rolling, wilting.",
  water:
    "Water stress management: Switch to drip/sprinkler irrigation for 40-60% water saving. Rainwater harvesting in farm ponds. Contact MWRRA for water allocation assistance.",
  cotton:
    "Cotton heat advisory: Maintain soil moisture at 50-60% field capacity. Apply potassium (K) fertilizer to improve heat tolerance. Watch for bollworm infestation which increases under heat stress.",
};

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 20, window: 60 });
  if (limited) return limited;

  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { message, sessionId, language } = chatMessageSchema.parse(body);

    // Get conversation history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 10, // Last 10 messages for context
    });

    // Save user message
    await prisma.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });

    const messages = [
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: message },
    ];

    let response: string;

    // Try Groq first, fallback to knowledge base
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "gsk_demo_key") {
      try {
        response = await generateChatResponse({
          messages,
          userContext: {
            district: session.user.districtName,
            language,
            role: session.user.role,
          },
        });
      } catch {
        response = getKnowledgeBaseResponse(message);
      }
    } else {
      response = getKnowledgeBaseResponse(message);
    }

    // Save assistant response
    await prisma.chatMessage.create({
      data: { sessionId, role: "assistant", content: response },
    });

    return NextResponse.json({ response, sessionId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

function getKnowledgeBaseResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("pmfby") || lower.includes("insurance") || lower.includes("विमा")) {
    return KNOWLEDGE_BASE.pmfby;
  }
  if (lower.includes("heat") || lower.includes("temperature") || lower.includes("गरम")) {
    return KNOWLEDGE_BASE.heat;
  }
  if (lower.includes("water") || lower.includes("irrigation") || lower.includes("पाणी")) {
    return KNOWLEDGE_BASE.water;
  }
  if (lower.includes("cotton") || lower.includes("कापूस")) {
    return KNOWLEDGE_BASE.cotton;
  }
  return KNOWLEDGE_BASE.default;
}
