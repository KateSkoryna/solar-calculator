import { useSyncExternalStore } from "react";

export const COMPACT_VIEWPORT_MEDIA_QUERY = "(max-width: 767px)";
export const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

function supportsMatchMedia() {
  return typeof window.matchMedia === "function";
}

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (notifyChange) => {
      if (!supportsMatchMedia()) return () => {};
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", notifyChange);
      return () => mediaQueryList.removeEventListener("change", notifyChange);
    },
    () => supportsMatchMedia() && window.matchMedia(query).matches,
    () => false,
  );
}
