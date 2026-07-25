import { Session } from "next-auth";
import { ForbiddenError, requireFleetRole } from "@/lib/fleet-auth";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    fleetMembership: {
      findUnique: jest.fn(),
    },
  },
}));

const mockedFindUnique = prisma.fleetMembership.findUnique as jest.Mock;

function sessionFor(userId: string): Session {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as Session;
}

function membershipFor(role: string) {
  return {
    id: "membership-1",
    fleetId: "fleet-1",
    userId: "user-1",
    role,
    createdAt: new Date(),
  };
}

describe("requireFleetRole", () => {
  beforeEach(() => {
    mockedFindUnique.mockReset();
  });

  it("throws ForbiddenError when there is no session", async () => {
    await expect(requireFleetRole(null, "fleet-1", ["OWNER"])).rejects.toThrow(
      ForbiddenError,
    );

    expect(mockedFindUnique).not.toHaveBeenCalled();
  });

  it("throws a ForbiddenError carrying a 403 status code", async () => {
    mockedFindUnique.mockResolvedValue(null);

    await expect(
      requireFleetRole(sessionFor("user-1"), "fleet-1", ["OWNER"]),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("throws ForbiddenError when the user has no membership in the fleet", async () => {
    mockedFindUnique.mockResolvedValue(null);

    await expect(
      requireFleetRole(sessionFor("user-1"), "fleet-1", ["OWNER"]),
    ).rejects.toThrow(ForbiddenError);
  });

  it("throws ForbiddenError when the membership role is outside the allowed set", async () => {
    mockedFindUnique.mockResolvedValue(membershipFor("VIEWER"));

    await expect(
      requireFleetRole(sessionFor("user-1"), "fleet-1", ["OWNER", "MANAGER"]),
    ).rejects.toThrow(ForbiddenError);
  });

  it("returns the membership when the role is allowed", async () => {
    const membership = membershipFor("OWNER");
    mockedFindUnique.mockResolvedValue(membership);

    await expect(
      requireFleetRole(sessionFor("user-1"), "fleet-1", ["OWNER", "MANAGER"]),
    ).resolves.toEqual(membership);
  });

  it("scopes the membership lookup to the given fleet and the session user", async () => {
    mockedFindUnique.mockResolvedValue(membershipFor("OWNER"));

    await requireFleetRole(sessionFor("user-1"), "fleet-1", ["OWNER"]);

    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        fleetId_userId: {
          fleetId: "fleet-1",
          userId: "user-1",
        },
      },
    });
  });
});
