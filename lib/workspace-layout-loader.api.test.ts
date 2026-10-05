import { prisma } from "@/lib/prisma";
import { loadWorkspaceLayout } from "@/lib/workspace-layout-loader";
import {
  FleetFixtures,
  resetDatabase,
  seedFleetFixtures,
} from "@/test-support/fixtures";

let fixtures: FleetFixtures;

function sessionFor(userId: string) {
  return {
    user: { id: userId },
    expires: new Date(Date.now() + 60_000).toISOString(),
  };
}

beforeEach(async () => {
  await resetDatabase();
  fixtures = await seedFleetFixtures();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("loading the workspace layout", () => {
  it("returns the fleet and the user's fleets to a member", async () => {
    const workspace = await loadWorkspaceLayout(
      sessionFor(fixtures.viewerA.id),
      fixtures.fleetA.slug,
    );

    expect(workspace?.currentFleet.slug).toBe(fixtures.fleetA.slug);
    expect(workspace?.fleets.map(({ slug }) => slug)).toEqual([
      fixtures.fleetA.slug,
    ]);
  });

  it("lists every fleet the user belongs to", async () => {
    await prisma.fleetMembership.create({
      data: {
        fleetId: fixtures.fleetB.id,
        userId: fixtures.ownerA.id,
        role: "VIEWER",
      },
    });

    const workspace = await loadWorkspaceLayout(
      sessionFor(fixtures.ownerA.id),
      fixtures.fleetA.slug,
    );

    expect(workspace?.fleets.map(({ slug }) => slug).sort()).toEqual(
      [fixtures.fleetA.slug, fixtures.fleetB.slug].sort(),
    );
  });

  it("returns not found for a user from another fleet", async () => {
    expect(
      await loadWorkspaceLayout(
        sessionFor(fixtures.ownerB.id),
        fixtures.fleetA.slug,
      ),
    ).toBeNull();
  });

  it("returns not found for a signed-out visitor", async () => {
    expect(await loadWorkspaceLayout(null, fixtures.fleetA.slug)).toBeNull();
  });

  it("returns not found for an unknown fleet", async () => {
    expect(
      await loadWorkspaceLayout(
        sessionFor(fixtures.ownerA.id),
        "no-such-fleet",
      ),
    ).toBeNull();
  });
});
