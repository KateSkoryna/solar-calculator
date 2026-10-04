import { render, screen } from "@testing-library/react";
import Badge, { BADGE_VARIANTS } from "./Badge";

const BADGE_LABEL = "Sample figures";

describe("Badge", () => {
  it.each(BADGE_VARIANTS)("renders its label as the %s variant", (variant) => {
    render(<Badge variant={variant}>{BADGE_LABEL}</Badge>);

    expect(screen.getByText(BADGE_LABEL)).toBeInTheDocument();
  });
});
