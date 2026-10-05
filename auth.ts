import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSmtpServerConfig } from "@/lib/email/smtp-settings";
import { sendSignInLink } from "@/lib/email/send-sign-in-link";
import { SIGN_IN_LINK_MAX_AGE_SECONDS } from "@/lib/sign-in-link-lifetime";
import { ADMIN_FLEET_ID } from "@/lib/fleet-auth";
import { handleSignInEvent } from "@/lib/sign-in-event";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  useSecureCookies: process.env.VERCEL === "1",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: getSmtpServerConfig(),
      from: process.env.EMAIL_FROM,
      maxAge: SIGN_IN_LINK_MAX_AGE_SECONDS,
      sendVerificationRequest: sendSignInLink,
    }),
  ],
  events: {
    signIn: handleSignInEvent,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const adminMembership = await prisma.fleetMembership.findUnique({
          where: {
            fleetId_userId: { fleetId: ADMIN_FLEET_ID, userId: user.id },
          },
        });
        token.isSuperAdmin = adminMembership !== null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
});
