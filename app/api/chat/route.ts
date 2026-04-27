import { NextRequest, NextResponse } from "next/server";
import { getGroqClient, SYSTEM_PROMPT } from "@/lib/groq";

const MOCK_RESPONSES: Record<string, string> = {
  default:
    "I'm CascadeCity AI, your Maharashtra agricultural intelligence assistant. I can help you with heat stress analysis, crop management advice, water conservation strategies, and policy recommendations across all 36 Maharashtra districts. What would you like to know?",
  heat: "Current heat stress is highest in Vidarbha region (Nagpur, Wardha, Yavatmal) with temperatures exceeding 42-45°C. Marathwada (Beed, Latur, Osmanabad) also shows critical water stress levels. Recommended: activate cooling centers, restrict field work 11 AM - 4 PM, ensure livestock shelter.",
  drought:
    "Marathwada districts (Beed, Latur, Osmanabad, Aurangabad) are experiencing severe drought conditions this season. Water table has dropped 15-20% below normal. Suggest activating MGNREGS water conservation works, tanker supply to distressed villages, and fast-tracking PMFBY claims.",
  crop: "Major crop damage risks: Cotton bollworm in Vidarbha (Akola, Washim, Yavatmal), onion price crash in Nashik, soybean late blight in Marathwada. District Agriculture Officers should conduct immediate field surveys and activate state calamity relief fund.",
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("heat") || lower.includes("temperature")) return MOCK_RESPONSES.heat;
  if (lower.includes("drought") || lower.includes("water")) return MOCK_RESPONSES.drought;
  if (lower.includes("crop") || lower.includes("farm") || lower.includes("pest")) return MOCK_RESPONSES.crop;
  return MOCK_RESPONSES.default;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const groq = getGroqClient();
    if (!groq) {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const reply = getMockResponse(lastMessage);
      return NextResponse.json({
        reply,
        model: "mock",
        note: "Configure GROQ_API_KEY for real AI responses",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      max_tokens: 600,
    });

    const reply = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ reply, model: "llama-3.1-70b-versatile" });
  } catch {
    return NextResponse.json({ error: "Chat service unavailable" }, { status: 500 });
  }
}
