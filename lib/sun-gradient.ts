export const SUN_CORE_COLOR_VARIABLE = "--sun-core";
export const SUN_COLOR_VARIABLE = "--sun";

export const SUN_FALLBACK_COLORS: Record<string, string> = {
  [SUN_CORE_COLOR_VARIABLE]: "#fff1c2",
  [SUN_COLOR_VARIABLE]: "#f2b544",
};

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export function resolveSunColor(computedValue: string, colorVariable: string) {
  const color = computedValue.trim();
  return HEX_COLOR_PATTERN.test(color)
    ? color
    : SUN_FALLBACK_COLORS[colorVariable];
}

export function withAlpha(hexColor: string, alpha: number) {
  const alphaByte = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  return `${hexColor}${alphaByte.toString(16).padStart(2, "0")}`;
}
