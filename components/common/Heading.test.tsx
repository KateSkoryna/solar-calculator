import { render, screen } from "@testing-library/react";
import Heading, { HEADING_SIZES } from "./Heading";
import Text, { TEXT_SIZES } from "./Text";

const SAMPLE_COPY = "Pays off in 1.5 years";

describe("Heading", () => {
  it.each([1, 2, 3, 4] as const)("renders a level %s heading", (level) => {
    render(
      <Heading level={level} size="title">
        {SAMPLE_COPY}
      </Heading>,
    );

    expect(
      screen.getByRole("heading", { level, name: SAMPLE_COPY }),
    ).toBeInTheDocument();
  });

  it.each(HEADING_SIZES)("renders the %s size", (size) => {
    render(
      <Heading level={2} size={size} id="sample-heading">
        {SAMPLE_COPY}
      </Heading>,
    );

    expect(screen.getByRole("heading", { name: SAMPLE_COPY })).toHaveAttribute(
      "id",
      "sample-heading",
    );
  });
});

describe("Text", () => {
  it.each(TEXT_SIZES)("renders a paragraph in the %s size", (size) => {
    render(<Text size={size}>{SAMPLE_COPY}</Text>);

    expect(screen.getByText(SAMPLE_COPY).tagName).toBe("P");
  });

  it("renders as the element passed in the as prop", () => {
    render(<Text as="span">{SAMPLE_COPY}</Text>);

    expect(screen.getByText(SAMPLE_COPY).tagName).toBe("SPAN");
  });
});
