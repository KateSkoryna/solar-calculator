import { prisma } from "@/lib/prisma";
import { claimPendingInvitations } from "@/lib/invitation-service";

const EMAIL_LINK_PROVIDER_ID = "nodemailer";
const GOOGLE_PROVIDER_ID = "google";

interface SignInEventParams {
  user: { id?: string; email?: string | null };
  account?: { provider: string } | null;
  profile?: { email_verified?: boolean | null } | null;
}

export function isEmailVerifiedByProvider({
  account,
  profile,
}: Pick<SignInEventParams, "account" | "profile">) {
  if (account?.provider === EMAIL_LINK_PROVIDER_ID) return true;
  if (account?.provider === GOOGLE_PROVIDER_ID) {
    return profile?.email_verified === true;
  }
  return false;
}

export async function handleSignInEvent({
  user,
  account,
  profile,
}: SignInEventParams) {
  if (!user.id || !user.email) return;
  if (!isEmailVerifiedByProvider({ account, profile })) return;

  const { id: userId, email } = user;
  await prisma.$transaction((transaction) =>
    claimPendingInvitations(transaction, { userId, email }),
  );
}
