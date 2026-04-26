import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { AuthError } from "next-auth";

const schema = z.object({
  phone: z.string().min(10),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, window: 60 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { phone, otp } = schema.parse(body);

    const result = await signIn("credentials", {
      phone,
      otp,
      redirect: false,
    });

    if (!result) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }

    return NextResponse.json({ success: true, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof AuthError) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    }
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
