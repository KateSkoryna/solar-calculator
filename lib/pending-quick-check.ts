import {
  quickCheckSchema,
  type QuickCheckAnswers,
} from "@/lib/quick-check-schema";

export const PENDING_QUICK_CHECK_STORAGE_KEY = "pendingQuickCheck";
export const PENDING_QUICK_CHECK_COOKIE_NAME = "pendingQuickCheck";

const PENDING_QUICK_CHECK_COOKIE_MAX_AGE_SECONDS = 60 * 60;
const PENDING_QUICK_CHECK_COOKIE_ATTRIBUTES = "path=/; SameSite=Lax";

function setPendingQuickCheckFlag() {
  document.cookie = `${PENDING_QUICK_CHECK_COOKIE_NAME}=1; ${PENDING_QUICK_CHECK_COOKIE_ATTRIBUTES}; max-age=${PENDING_QUICK_CHECK_COOKIE_MAX_AGE_SECONDS}`;
}

function removePendingQuickCheckFlag() {
  document.cookie = `${PENDING_QUICK_CHECK_COOKIE_NAME}=; ${PENDING_QUICK_CHECK_COOKIE_ATTRIBUTES}; max-age=0`;
}

export function savePendingQuickCheck(answers: QuickCheckAnswers) {
  try {
    localStorage.setItem(
      PENDING_QUICK_CHECK_STORAGE_KEY,
      JSON.stringify(answers),
    );
    setPendingQuickCheckFlag();
    return true;
  } catch {
    return false;
  }
}

export function readPendingQuickCheck(): QuickCheckAnswers | null {
  try {
    const stored = localStorage.getItem(PENDING_QUICK_CHECK_STORAGE_KEY);
    if (stored === null) return null;
    const parsed = quickCheckSchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearPendingQuickCheck() {
  try {
    localStorage.removeItem(PENDING_QUICK_CHECK_STORAGE_KEY);
    removePendingQuickCheckFlag();
    return true;
  } catch {
    return false;
  }
}
