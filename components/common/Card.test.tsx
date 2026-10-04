import { render, screen } from "@testing-library/react";
import Card, { CARD_TONES } from "./Card";

const CARD_TITLE = "Payback";
const CARD_BODY = "Card body";

describe("Card", () => {
  it.each(CARD_TONES)("renders its content with the %s tone", (tone) => {
    render(<Card tone={tone}>{CARD_BODY}</Card>);

    expect(screen.getByText(CARD_BODY)).toBeInTheDocument();
  });

  it("renders as the element passed in the as prop", () => {
    render(<Card as="article">{CARD_BODY}</Card>);

    expect(screen.getByRole("article")).toHaveTextContent(CARD_BODY);
  });

  it("renders a header with a title and an action", () => {
    render(
      <Card title={CARD_TITLE} action={<button type="button">Edit</button>}>
        {CARD_BODY}
      </Card>,
    );

    expect(screen.getByText(CARD_TITLE)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
