import { readFileSync } from "node:fs";
import { join } from "node:path";

const DESIGN_TOKEN_NAMES = [
  "ground",
  "side",
  "surface",
  "soft",
  "ink",
  "muted",
  "line",
  "line-strong",
  "track",
  "segment-track",
  "lime",
  "on-lime",
  "lime-soft",
  "lime-soft-ink",
  "forest",
  "hero",
  "hero-muted",
  "chart-profit",
  "chart-payoff",
  "sun",
  "warn-soft",
  "warn-ink",
  "danger",
];

const LIGHT_BLOCK_SELECTOR = ":root";
const DARK_BLOCK_SELECTOR = ':root[data-theme="dark"]';

const globalStylesheet = readFileSync(
  join(process.cwd(), "app", "globals.css"),
  "utf8",
);

function readBlockBody(selector: string): string {
  const blockStart = globalStylesheet.indexOf(`${selector} {`);
  if (blockStart === -1) {
    throw new Error(`Block ${selector} is missing from app/globals.css`);
  }
  const bodyStart = globalStylesheet.indexOf("{", blockStart) + 1;
  const bodyEnd = globalStylesheet.indexOf("}", bodyStart);
  return globalStylesheet.slice(bodyStart, bodyEnd);
}

function readDefinedTokenNames(selector: string): string[] {
  const customPropertyPattern = /--([a-z0-9-]+)\s*:/g;
  return Array.from(
    readBlockBody(selector).matchAll(customPropertyPattern),
    (match) => match[1],
  );
}

describe("design tokens", () => {
  const lightTokenNames = readDefinedTokenNames(LIGHT_BLOCK_SELECTOR);
  const darkTokenNames = readDefinedTokenNames(DARK_BLOCK_SELECTOR);

  it.each(DESIGN_TOKEN_NAMES)("defines %s in the light block", (tokenName) => {
    expect(lightTokenNames).toContain(tokenName);
  });

  it.each(DESIGN_TOKEN_NAMES)("defines %s in the dark block", (tokenName) => {
    expect(darkTokenNames).toContain(tokenName);
  });

  it("exposes every token to Tailwind as a colour utility", () => {
    const themeTokenNames = readDefinedTokenNames("@theme inline");
    DESIGN_TOKEN_NAMES.forEach((tokenName) => {
      expect(themeTokenNames).toContain(`color-${tokenName}`);
    });
  });
});
