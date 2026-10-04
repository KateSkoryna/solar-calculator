import {
  quickCheckSchema,
  type QuickCheckAnswers,
} from "@/lib/quick-check-schema";

export const PENDING_QUICK_CHECK_STORAGE_KEY = "pendingQuickCheck";

export function savePendingQuickCheck(answers: QuickCheckAnswers) {
  try {
    sessionStorage.setItem(
      PENDING_QUICK_CHECK_STORAGE_KEY,
      JSON.stringify(answers),
    );
    return true;
  } catch {
    return false;
  }
}

export function readPendingQuickCheck(): QuickCheckAnswers | null {
  try {
    const stored = sessionStorage.getItem(PENDING_QUICK_CHECK_STORAGE_KEY);
    if (stored === null) return null;
    const parsed = quickCheckSchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearPendingQuickCheck() {
  try {
    sessionStorage.removeItem(PENDING_QUICK_CHECK_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
