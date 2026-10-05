import { render, screen, waitFor } from "@testing-library/react";
import AnimatedSun from "./AnimatedSun";
import {
  hasPlayedSunAnimation,
  markSunAnimationPlayed,
} from "@/lib/sun-animation-session";

function stubDrawableCanvas() {
  const drawingContext = {
    arc: jest.fn(),
    beginPath: jest.fn(),
    clearRect: jest.fn(),
    fill: jest.fn(),
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

  it("keeps one lighter circle on the finished sun", () => {
    const { container } = render(<AnimatedSun />);

    expect(container.querySelectorAll("[data-sun-highlight]")).toHaveLength(1);
  });

  it("skips the animation once it has played in this session", async () => {
    const drawingContext = stubDrawableCanvas();
    markSunAnimationPlayed();

    const { container } = render(<AnimatedSun />);

    await waitFor(() =>
      expect(
        container.querySelector("[data-brand-illustration]")?.parentElement,
      ).toHaveClass("opacity-100"),
    );
    expect(drawingContext.arc).not.toHaveBeenCalled();
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
