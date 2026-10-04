import type { Prisma } from "@/app/generated/prisma/client";
import type { Role } from "@/app/generated/prisma/enums";
import { AuditAction, AuditEntityType, recordAuditEvent } from "@/lib/audit";

interface InviteOrAddMemberParams {
  fleetId: string;
  email: string;
  role: Role;
  actorUserId: string;
}

interface ClaimPendingInvitationsParams {
  userId: string;
  email: string;
}

export async function inviteOrAddMember(
  transaction: Prisma.TransactionClient,
  { fleetId, email, role, actorUserId }: InviteOrAddMemberParams,
) {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await transaction.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
  });

  if (existingUser) {
    const member = await transaction.fleetMembership.create({
      data: { fleetId, userId: existingUser.id, role },
    });

    await recordAuditEvent(transaction, {
      fleetId,
      actorUserId,
      action: AuditAction.MEMBERSHIP_ADDED,
      entityType: AuditEntityType.MEMBERSHIP,
      entityId: member.id,
      metadata: { userId: existingUser.id, role },
    });

    return { member };
  }

  const invitation = await transaction.fleetInvitation.upsert({
    where: { fleetId_email: { fleetId, email: normalizedEmail } },
    create: {
      fleetId,
      email: normalizedEmail,
      role,
      invitedByUserId: actorUserId,
    },
    update: { role, invitedByUserId: actorUserId },
  });

  await recordAuditEvent(transaction, {
    fleetId,
    actorUserId,
    action: AuditAction.INVITATION_CREATED,
    entityType: AuditEntityType.INVITATION,
    entityId: invitation.id,
    metadata: { email: normalizedEmail, role },
  });

  return { invitation };
}

export async function claimPendingInvitations(
  transaction: Prisma.TransactionClient,
  { userId, email }: ClaimPendingInvitationsParams,
) {
  const invitations = await transaction.fleetInvitation.findMany({
    where: { email: email.trim().toLowerCase() },
  });

  for (const invitation of invitations) {
    const membership = await transaction.fleetMembership.upsert({
      where: {
        fleetId_userId: { fleetId: invitation.fleetId, userId },
      },
      create: { fleetId: invitation.fleetId, userId, role: invitation.role },
      update: {},
    });

    await transaction.fleetInvitation.deleteMany({
      where: { id: invitation.id },
    });

    await recordAuditEvent(transaction, {
      fleetId: invitation.fleetId,
      actorUserId: userId,
      action: AuditAction.INVITATION_CLAIMED,
      entityType: AuditEntityType.INVITATION,
      entityId: invitation.id,
      metadata: { membershipId: membership.id, role: invitation.role },
    });
  }

  return invitations.length;
}
