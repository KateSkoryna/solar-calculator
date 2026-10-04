import type { Prisma } from "@/app/generated/prisma/client";

const MAX_FLEET_SLUG_LENGTH = 48;
const FIRST_DUPLICATE_SUFFIX_NUMBER = 2;
const FALLBACK_FLEET_SLUG = "fleet";

export const RESERVED_FLEET_SLUGS: readonly string[] = [
  "calculator",
  "check-email",
  "login",
  "register",
  "user",
  "api",
  "results",
  "workspace",
  "onboarding",
  "dev",
];

const GERMAN_TRANSLITERATIONS: Record<string, string> = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  ß: "ss",
};

function transliterate(text: string) {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (character) => GERMAN_TRANSLITERATIONS[character])
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function trimDashes(text: string) {
  return text.replace(/^-+|-+$/g, "");
}

function truncateSlug(slug: string, maxLength: number) {
  return trimDashes(slug.slice(0, maxLength));
}

export function slugifyFleetName(name: string) {
  const dashedName = transliterate(name).replace(/[^a-z0-9]+/g, "-");
  return truncateSlug(trimDashes(dashedName), MAX_FLEET_SLUG_LENGTH);
}

async function isSlugAvailable(
  transaction: Prisma.TransactionClient,
  slug: string,
) {
  if (RESERVED_FLEET_SLUGS.includes(slug)) return false;
  const existingFleet = await transaction.fleet.findUnique({
    where: { slug },
    select: { id: true },
  });
  return existingFleet === null;
}

export async function createUniqueFleetSlug(
  transaction: Prisma.TransactionClient,
  name: string,
) {
  const baseSlug = slugifyFleetName(name) || FALLBACK_FLEET_SLUG;

  if (await isSlugAvailable(transaction, baseSlug)) return baseSlug;

  for (let number = FIRST_DUPLICATE_SUFFIX_NUMBER; ; number += 1) {
    const suffix = `-${number}`;
    const candidate =
      truncateSlug(baseSlug, MAX_FLEET_SLUG_LENGTH - suffix.length) + suffix;
    if (await isSlugAvailable(transaction, candidate)) return candidate;
  }
}
