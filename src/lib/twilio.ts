import twilio from "twilio";

let twilioClient: twilio.Twilio | null = null;

function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken || accountSid.startsWith("AC") === false || authToken === "your_twilio_auth_token") {
      throw new Error("Twilio credentials not configured");
    }

    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  try {
    const client = getTwilioClient();
    await client.messages.create({
      body: `Your CascadeCity verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });
    return true;
  } catch (error) {
    console.error("SMS send error:", error);
    return false;
  }
}

export async function sendOTPWhatsApp(phone: string, otp: string): Promise<boolean> {
  try {
    const client = getTwilioClient();
    await client.messages.create({
      body: `🌾 *CascadeCity* - Your verification code is: *${otp}*\nValid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to: `whatsapp:${phone}`,
    });
    return true;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return false;
  }
}

export async function sendAlertSMS(phone: string, message: string): Promise<{ success: boolean; sid?: string }> {
  try {
    const client = getTwilioClient();
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });
    return { success: true, sid: msg.sid };
  } catch (error) {
    console.error("Alert SMS error:", error);
    return { success: false };
  }
}

export async function sendAlertWhatsApp(phone: string, message: string): Promise<{ success: boolean; sid?: string }> {
  try {
    const client = getTwilioClient();
    const msg = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER!,
      to: `whatsapp:${phone}`,
    });
    return { success: true, sid: msg.sid };
  } catch (error) {
    console.error("Alert WhatsApp error:", error);
    return { success: false };
  }
}

export function isTwilioConfigured(): boolean {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  return !!(sid && token && sid.startsWith("AC") && token !== "your_twilio_auth_token");
}
