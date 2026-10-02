import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/lib/audit";
import { Role } from "@/app/generated/prisma/enums";
import { handleSignInEvent } from "@/lib/sign-in-event";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";
import {
  GET as listMembers,
  POST as inviteMember,
} from "../[fleetId]/members/route";
import { DELETE as cancelInvitation } from "../[fleetId]/invitations/[invitationId]/route";

jest.mock("@/auth", () => ({ auth: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

let fixtures: FleetFixtures;

function signInAs(user: { id: string } | null) {
  mockedAuth.mockResolvedValue(
    user
      ? {
          user: { id: user.id },
          expires: new Date(Date.now() + 60_000).toISOString(),
        }
      : null,
  );
}

function invite(fleetId: string, body: unknown) {
  return inviteMember(
    new Request(`http://localhost/api/fleets/${fleetId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ fleetId }) },
  );
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
  signInAs(fixtures.ownerA);
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/fleets/[fleetId]/members", () => {
  it("creates an invitation and no user for an unknown email", async () => {
    const response = await invite(fixtures.fleetA.id, {
      email: "New.Person@Example.com",
      role: Role.MANAGER,
    });
    const { invitation } = await response.json();

    expect(response.status).toBe(201);
    expect(invitation.email).toBe("new.person@example.com");
    expect(invitation.role).toBe(Role.MANAGER);
    expect(
      await prisma.user.findFirst({
        where: {
          email: { equals: "new.person@example.com", mode: "insensitive" },
        },
      }),
    ).toBeNull();
    expect(
      await prisma.auditEvent.count({
        where: { action: AuditAction.INVITATION_CREATED },
      }),
    ).toBe(1);
  });

  it("creates a membership directly for an existing user", async () => {
    const existingUser = await prisma.user.create({
      data: { email: "existing@example.com" },
    });

    const response = await invite(fixtures.fleetA.id, {
      email: "existing@example.com",
      role: Role.VIEWER,
    });
    const { member, invitation } = await response.json();

    expect(response.status).toBe(201);
    expect(invitation).toBeUndefined();
    expect(member.userId).toBe(existingUser.id);
    expect(await prisma.fleetInvitation.count()).toBe(0);
  });

  it("updates the role when the same email is invited twice", async () => {
    await invite(fixtures.fleetA.id, {
      email: "twice@example.com",
      role: Role.VIEWER,
    });
    const response = await invite(fixtures.fleetA.id, {
      email: "twice@example.com",
      role: Role.MANAGER,
    });

    expect(response.status).toBe(201);
    const invitations = await prisma.fleetInvitation.findMany();
    expect(invitations).toHaveLength(1);
    expect(invitations[0].role).toBe(Role.MANAGER);
  });

  it.each(["managerA", "viewerA"] as const)(
    "rejects an invitation from %s with 403",
    async (memberKey) => {
      signInAs(fixtures[memberKey]);

      const response = await invite(fixtures.fleetA.id, {
        email: "blocked@example.com",
        role: Role.VIEWER,
      });

      expect(response.status).toBe(403);
      expect(await prisma.fleetInvitation.count()).toBe(0);
    },
  );
});

describe("claiming invitations on sign-in", () => {
  async function inviteNewcomer() {
    await invite(fixtures.fleetA.id, {
      email: "newcomer@example.com",
      role: Role.MANAGER,
    });
  }

  async function createNewcomer(email = "newcomer@example.com") {
    return prisma.user.create({ data: { email } });
  }

  it("creates the membership with the invited role and removes the invitation", async () => {
    await inviteNewcomer();
    const newcomer = await createNewcomer();

    await handleSignInEvent({
      user: newcomer,
      account: { provider: "nodemailer" },
    });

    const membership = await prisma.fleetMembership.findUniqueOrThrow({
      where: {
        fleetId_userId: { fleetId: fixtures.fleetA.id, userId: newcomer.id },
      },
    });
    expect(membership.role).toBe(Role.MANAGER);
    expect(await prisma.fleetInvitation.count()).toBe(0);
    expect(
      await prisma.auditEvent.count({
        where: { action: AuditAction.INVITATION_CLAIMED },
      }),
    ).toBe(1);
  });

  it("claims for a Google account with a verified email", async () => {
    await inviteNewcomer();
    const newcomer = await createNewcomer();

    await handleSignInEvent({
      user: newcomer,
      account: { provider: "google" },
      profile: { email_verified: true },
    });

    expect(
      await prisma.fleetMembership.count({ where: { userId: newcomer.id } }),
    ).toBe(1);
  });

  it("gives nothing to a user with a different email", async () => {
    await inviteNewcomer();
    const stranger = await createNewcomer("stranger@example.com");

    await handleSignInEvent({
      user: stranger,
      account: { provider: "nodemailer" },
    });

    expect(
      await prisma.fleetMembership.count({ where: { userId: stranger.id } }),
    ).toBe(0);
    expect(await prisma.fleetInvitation.count()).toBe(1);
  });

  it.each([
    [
      "a Google account with an unverified email",
      { provider: "google" },
      { email_verified: false },
    ],
    [
      "a Google account without a verification flag",
      { provider: "google" },
      {},
    ],
    ["an unknown provider", { provider: "other" }, { email_verified: true }],
  ])("never claims for %s", async (_label, account, profile) => {
    await inviteNewcomer();
    const newcomer = await createNewcomer();

    await handleSignInEvent({ user: newcomer, account, profile });

    expect(
      await prisma.fleetMembership.count({ where: { userId: newcomer.id } }),
    ).toBe(0);
    expect(await prisma.fleetInvitation.count()).toBe(1);
  });
});

describe("pending invitation management", () => {
  it("lists pending invitations for owners only", async () => {
    await invite(fixtures.fleetA.id, {
      email: "pending@example.com",
      role: Role.VIEWER,
    });
    const params = { params: Promise.resolve({ fleetId: fixtures.fleetA.id }) };
    const request = new Request("http://localhost");

    const ownerView = await (await listMembers(request, params)).json();
    signInAs(fixtures.viewerA);
    const viewerView = await (await listMembers(request, params)).json();

    expect(ownerView.invitations).toHaveLength(1);
    expect(viewerView.invitations).toEqual([]);
  });

  it("lets an owner cancel an invitation and blocks other fleets", async () => {
    const { invitation } = await (
      await invite(fixtures.fleetA.id, {
        email: "cancel@example.com",
        role: Role.VIEWER,
      })
    ).json();
    const cancel = (fleetId: string) =>
      cancelInvitation(new Request("http://localhost", { method: "DELETE" }), {
        params: Promise.resolve({ fleetId, invitationId: invitation.id }),
      });

    signInAs(fixtures.ownerB);
    expect((await cancel(fixtures.fleetA.id)).status).toBe(403);

    signInAs(fixtures.ownerA);
    expect((await cancel(fixtures.fleetA.id)).status).toBe(204);
    expect(await prisma.fleetInvitation.count()).toBe(0);
  });
});
