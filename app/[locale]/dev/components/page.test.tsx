import { screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import ComponentShowcasePage from "./page";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const NOT_FOUND_SIGNAL = "NEXT_NOT_FOUND";

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("ComponentShowcasePage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.mocked(notFound).mockClear();
  });

  it("calls notFound in production", () => {
    jest.replaceProperty(process.env, "NODE_ENV", "production");
    jest.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderWithIntl(<ComponentShowcasePage />)).toThrow(
      NOT_FOUND_SIGNAL,
    );
    expect(notFound).toHaveBeenCalled();
  });

  it("renders the showcase outside production", () => {
    renderWithIntl(<ComponentShowcasePage />);

    expect(notFound).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: englishMessages.devShowcase.title,
      }),
    ).toBeInTheDocument();
  });
});
