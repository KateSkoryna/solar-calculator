import { render, screen, waitFor } from "@testing-library/react";
import AnimatedSun from "./AnimatedSun";
import { resolveSunColor, withAlpha } from "@/lib/sun-gradient";
import {
  hasPlayedSunAnimation,
  markSunAnimationPlayed,
} from "@/lib/sun-animation-session";

function stubDrawableCanvas() {
  const drawingContext = {
    arc: jest.fn(),
    beginPath: jest.fn(),
    clearRect: jest.fn(),
    createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    fill: jest.fn(),
    fillRect: jest.fn(),
    setTransform: jest.fn(),
  };
  jest
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockReturnValue(drawingContext as never);
  window.ResizeObserver = class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
  return drawingContext;
}

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("AnimatedSun", () => {
  it("shows the sun when the browser cannot draw the animation", async () => {
    const { container } = render(<AnimatedSun />);

    expect(container.querySelector("canvas")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    const sun = container.querySelector("[data-brand-illustration]");
    expect(sun).toBeInTheDocument();
    await waitFor(() => expect(sun?.parentElement).toHaveClass("opacity-100"));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("finishes as a sun with two orbits and a lens flare", () => {
    const { container } = render(<AnimatedSun />);

    expect(container.querySelectorAll("[data-sun-orbit]")).toHaveLength(2);
    expect(
      container.querySelectorAll("[data-lens-flare]").length,
    ).toBeGreaterThan(0);
  });

  it("shows the sun at once and only wandering sparkles after the first play", async () => {
    const drawingContext = stubDrawableCanvas();
    markSunAnimationPlayed();

    const { container } = render(<AnimatedSun />);

    await waitFor(() =>
      expect(
        container.querySelector("[data-brand-illustration]")?.parentElement,
      ).toHaveClass("opacity-100"),
    );
    await waitFor(() => expect(drawingContext.arc).toHaveBeenCalled());
  });

  it("plays the animation for a first visit", async () => {
    const drawingContext = stubDrawableCanvas();

    render(<AnimatedSun />);

    await waitFor(() => expect(drawingContext.arc).toHaveBeenCalled());
    expect(hasPlayedSunAnimation()).toBe(false);
  });
});

describe("sun animation session", () => {
  it("remembers that the animation played", () => {
    expect(hasPlayedSunAnimation()).toBe(false);

    markSunAnimationPlayed();

    expect(hasPlayedSunAnimation()).toBe(true);
  });
});

describe("sun colours", () => {
  it("falls back to the token value when the stylesheet gives none", () => {
    expect(resolveSunColor("", "--sun")).toBe("#f2b544");
    expect(resolveSunColor(" #abcdef ", "--sun")).toBe("#abcdef");
  });

  it("adds transparency to a hex colour", () => {
    expect(withAlpha("#f2b544", 0)).toBe("#f2b54400");
    expect(withAlpha("#f2b544", 1)).toBe("#f2b544ff");
  });
});
