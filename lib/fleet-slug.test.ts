import fs from "node:fs";
import path from "node:path";
import {
  RESERVED_FLEET_SLUGS,
  createUniqueFleetSlug,
  slugifyFleetName,
} from "@/lib/fleet-slug";

const MAX_FLEET_SLUG_LENGTH = 48;
const LOCALE_APP_DIRECTORY = path.join(process.cwd(), "app", "[locale]");

function fakeTransaction(takenSlugs: string[]) {
  return {
    fleet: {
      findUnique: jest.fn(async ({ where }: { where: { slug: string } }) =>
        takenSlugs.includes(where.slug) ? { id: "existing" } : null,
      ),
    },
  } as never;
}

describe("slugifyFleetName", () => {
  it("transliterates German characters", () => {
    expect(slugifyFleetName("Müller Kühltransporte GmbH")).toBe(
      "mueller-kuehltransporte-gmbh",
    );
  });

  it("strips accents", () => {
    expect(slugifyFleetName("Café Crème")).toBe("cafe-creme");
  });

  it("trims whitespace and dashes", () => {
    expect(slugifyFleetName("  ACME  ")).toBe("acme");
    expect(slugifyFleetName("--ACME!!")).toBe("acme");
  });

  it("limits the length", () => {
    const slug = slugifyFleetName("a".repeat(100));
    expect(slug.length).toBeLessThanOrEqual(MAX_FLEET_SLUG_LENGTH);
  });

  it("does not end with a dash after truncation", () => {
    const slug = slugifyFleetName(`${"a".repeat(47)} b`);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("createUniqueFleetSlug", () => {
  it("uses the plain slug when it is free", async () => {
    expect(await createUniqueFleetSlug(fakeTransaction([]), "Nordwind")).toBe(
      "nordwind",
    );
  });

  it("appends increasing numbers for taken slugs", async () => {
    const transaction = fakeTransaction(["nordwind", "nordwind-2"]);
    expect(await createUniqueFleetSlug(transaction, "Nordwind")).toBe(
      "nordwind-3",
    );
  });

  it("never produces a reserved slug", async () => {
    const slug = await createUniqueFleetSlug(fakeTransaction([]), "Calculator");
    expect(slug).not.toBe("calculator");
    expect(RESERVED_FLEET_SLUGS).not.toContain(slug);
  });

  it("keeps suffixed slugs within the length limit", async () => {
    const longName = "a".repeat(100);
    const takenSlug = slugifyFleetName(longName);
    const slug = await createUniqueFleetSlug(
      fakeTransaction([takenSlug]),
      longName,
    );
    expect(slug.length).toBeLessThanOrEqual(MAX_FLEET_SLUG_LENGTH);
    expect(slug).not.toBe(takenSlug);
  });
});

function isRouteGroup(folderName: string) {
  return folderName.startsWith("(");
}

function listStaticRouteFolderNames(directory: string): string[] {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("["))
    .flatMap((entry) =>
      isRouteGroup(entry.name)
        ? listStaticRouteFolderNames(path.join(directory, entry.name))
        : [entry.name],
    );
}

describe("RESERVED_FLEET_SLUGS", () => {
  it("contains every static route folder under app/[locale], including those inside route groups", () => {
    const staticFolderNames = listStaticRouteFolderNames(LOCALE_APP_DIRECTORY);

    expect(staticFolderNames.length).toBeGreaterThan(0);
    staticFolderNames.forEach((folderName) =>
      expect(RESERVED_FLEET_SLUGS).toContain(folderName),
    );
  });
});
