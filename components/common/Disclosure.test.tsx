import { render, screen } from "@testing-library/react";
import Disclosure from "./Disclosure";

const DISCLOSURE_SUMMARY = "How we calculated this";
const DISCLOSURE_BODY = "Every number shows where it came from.";

describe("Disclosure", () => {
  it("is closed by default", () => {
    render(
      <Disclosure summary={DISCLOSURE_SUMMARY}>{DISCLOSURE_BODY}</Disclosure>,
    );

    expect(screen.getByRole("group")).not.toHaveAttribute("open");
    expect(screen.getByText(DISCLOSURE_SUMMARY)).toBeInTheDocument();
  });

  it("starts open when defaultOpen is set", () => {
    render(
      <Disclosure summary={DISCLOSURE_SUMMARY} defaultOpen>
        {DISCLOSURE_BODY}
      </Disclosure>,
    );

    expect(screen.getByRole("group")).toHaveAttribute("open");
    expect(screen.getByText(DISCLOSURE_BODY)).toBeInTheDocument();
  });
});
