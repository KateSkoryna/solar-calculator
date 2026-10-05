export const SUN_ANIMATION_PLAYED_STORAGE_KEY = "sunAnimationPlayed";

const PLAYED_VALUE = "true";

export function hasPlayedSunAnimation() {
  try {
    return (
      sessionStorage.getItem(SUN_ANIMATION_PLAYED_STORAGE_KEY) === PLAYED_VALUE
    );
  } catch {
    return false;
  }
}

export function markSunAnimationPlayed() {
  try {
    sessionStorage.setItem(SUN_ANIMATION_PLAYED_STORAGE_KEY, PLAYED_VALUE);
  } catch {
    return;
  }
}
