import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string;
        const otp = credentials?.otp as string;

        if (!phone || !otp) return null;

        const user = await prisma.user.findUnique({
          where: { phone },
          include: { district: { select: { name: true } } },
        });

        if (!user || !user.otp || !user.otpExpiry) return null;

        // Check OTP not expired
        if (new Date() > user.otpExpiry) return null;

        // Check OTP matches
        if (user.otp !== otp) return null;

        if (user.status === "suspended") return null;

        // Clear OTP after use
        await prisma.user.update({
          where: { id: user.id },
          data: {
            otp: null,
            otpExpiry: null,
            lastLogin: new Date(),
            status: user.status === "pending" ? "active" : user.status,
          },
        });

        return {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email || undefined,
          role: user.role,
          districtId: user.districtId || undefined,
          districtName: user.district?.name || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
        token.role = (user as { role?: string }).role;
        token.districtId = (user as { districtId?: string }).districtId;
        token.districtName = (user as { districtName?: string }).districtName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
        session.user.role = token.role as string;
        session.user.districtId = token.districtId as string | undefined;
        session.user.districtName = token.districtName as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 min inactivity timeout
  },
  secret: process.env.NEXTAUTH_SECRET,
});
