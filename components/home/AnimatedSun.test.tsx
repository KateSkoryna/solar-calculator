import { render, screen, waitFor } from "@testing-library/react";
import AnimatedSun from "./AnimatedSun";

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
});
