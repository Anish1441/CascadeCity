import Groq from "groq-sdk";

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY || "",
    });
  }
  return groqClient;
}

export async function generatePolicyRecommendation(params: {
  districtName: string;
  stressScore: number;
  waterStress: number;
  rainfallDeviation: number;
  primaryCrop: string;
  temperature?: number;
  aqi?: number;
}): Promise<string> {
  const client = getGroqClient();

  const prompt = `You are an expert agricultural policy advisor for Maharashtra, India.

District: ${params.districtName}
Heat Stress Score: ${params.stressScore}/100
Water Stress: ${params.waterStress}/100
Rainfall Deviation: ${params.rainfallDeviation}%
Primary Crop: ${params.primaryCrop}
Temperature: ${params.temperature ? `${params.temperature}°C` : "N/A"}
AQI: ${params.aqi || "N/A"}

Generate 3 specific, actionable policy recommendations to address the agricultural stress in this district. 
Format as JSON array with this structure:
[
  {
    "title": "Policy title",
    "description": "Detailed description",
    "impact": "Expected impact",
    "benefitScore": 85,
    "costScore": 40,
    "feasibilityScore": 75
  }
]

Focus on: water conservation, crop advisory, farmer support schemes, and emergency relief.`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return completion.choices[0]?.message?.content || "[]";
}

export async function generateChatResponse(params: {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  userContext?: {
    district?: string;
    crop?: string;
    language?: string;
    role?: string;
  };
}): Promise<string> {
  const client = getGroqClient();

  const systemPrompt = `You are CascadeCity AI Assistant, an expert agricultural advisor for Maharashtra, India.
You help farmers, field agents, and policy makers with:
- Crop management and best practices
- Water stress and irrigation advice  
- Pest and disease management
- Government scheme information (PMFBY, KCC, Namo Shetkari)
- Weather impact on agriculture
- Policy recommendations

${params.userContext?.district ? `User is from ${params.userContext.district} district.` : ""}
${params.userContext?.crop ? `Primary crop: ${params.userContext.crop}` : ""}
${params.userContext?.language === "mr" ? "Respond in Marathi (मराठी) when possible." : ""}
${params.userContext?.language === "hi" ? "Respond in Hindi when possible." : ""}
${params.userContext?.role ? `User role: ${params.userContext.role}` : ""}

Be helpful, specific, and practical. Cite specific programs and schemes when relevant.`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...params.messages,
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  return (
    completion.choices[0]?.message?.content ||
    "I'm sorry, I couldn't process your request. Please try again."
  );
}

export async function generateAlertMessage(params: {
  districtName: string;
  alertType: string;
  severity: string;
  targetAudience: "farmer" | "officer";
  language?: string;
}): Promise<string> {
  const client = getGroqClient();

  const langInstruction =
    params.language === "mr"
      ? "Write in Marathi"
      : params.language === "hi"
      ? "Write in Hindi"
      : "Write in English";

  const prompt = `Generate a ${params.severity} severity ${params.alertType} alert message for ${params.districtName} district, Maharashtra.
Target audience: ${params.targetAudience === "farmer" ? "Farmers (simple language)" : "Field Officers (technical)"}
${langInstruction}. Keep it under 160 characters for SMS. Be specific and actionable.`;

  const completion = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content || "";
}
