export const PENDING_SIGN_IN_EMAIL_STORAGE_KEY = "pendingSignInEmail";

export function savePendingSignInEmail(email: string) {
  try {
    sessionStorage.setItem(PENDING_SIGN_IN_EMAIL_STORAGE_KEY, email);
  } catch {
    return;
  }
}

export function readPendingSignInEmail() {
  try {
    return sessionStorage.getItem(PENDING_SIGN_IN_EMAIL_STORAGE_KEY);
  } catch {
    return null;
  }
}
