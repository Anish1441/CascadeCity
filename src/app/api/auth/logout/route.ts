import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { signOut } from "@/auth";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: session.user });
}
