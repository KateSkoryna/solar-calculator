import { fireEvent, render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

const PERSON_NAME = "Maria Schmidt";
const PERSON_INITIALS = "MS";
const PERSON_IMAGE_URL = "https://example.com/maria.png";

describe("Avatar", () => {
  it("shows initials named after the person", () => {
    render(<Avatar name={PERSON_NAME} />);

    expect(screen.getByRole("img", { name: PERSON_NAME })).toHaveTextContent(
      PERSON_INITIALS,
    );
  });

  it("uses one initial for a single-word name", () => {
    render(<Avatar name="maria" tone="neutral" />);

    expect(screen.getByRole("img", { name: "maria" })).toHaveTextContent("M");
  });

  it("shows the person's image when one is available", () => {
    render(<Avatar name={PERSON_NAME} imageUrl={PERSON_IMAGE_URL} />);

    expect(screen.getByRole("img", { name: PERSON_NAME })).toHaveAttribute(
      "src",
      PERSON_IMAGE_URL,
    );
  });

  it("sends no referrer so Google profile pictures load", () => {
    render(<Avatar name={PERSON_NAME} imageUrl={PERSON_IMAGE_URL} />);

    expect(screen.getByRole("img", { name: PERSON_NAME })).toHaveAttribute(
      "referrerpolicy",
      "no-referrer",
    );
  });

  it("falls back to initials when the image cannot be loaded", () => {
    render(<Avatar name={PERSON_NAME} imageUrl={PERSON_IMAGE_URL} />);

    fireEvent.error(screen.getByRole("img", { name: PERSON_NAME }));

    expect(screen.getByRole("img", { name: PERSON_NAME })).toHaveTextContent(
      PERSON_INITIALS,
    );
  });
});
