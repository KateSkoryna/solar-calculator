import { createHash } from "node:crypto";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
        .map(([key, nested]) => [key, sortKeysDeep(nested)]),
    );
  }
  return value;
}

export function hashQuickCheck(answers: QuickCheckAnswers) {
  return createHash("sha256")
    .update(JSON.stringify(sortKeysDeep(answers)))
    .digest("hex");
}
