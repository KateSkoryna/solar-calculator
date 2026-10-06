import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListPageLoading from "./ListPageLoading";
import PageError from "./PageError";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

describe("ListPageLoading", () => {
  it.each([
    ["vehicles.loading", englishMessages.vehicles.loading],
    ["calculations.loading", englishMessages.calculations.loading],
  ])("announces %s to assistive technology", (messageKey, text) => {
    renderWithIntl(<ListPageLoading messageKey={messageKey} />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText(text)).toBeInTheDocument();
  });
});

describe("PageError", () => {
  it.each([
    ["vehicles.error", englishMessages.vehicles.error],
    ["calculations.error", englishMessages.calculations.error],
  ])("explains the %s and offers a retry", async (messageKey, messages) => {
    const onRetry = jest.fn();
    renderWithIntl(<PageError messageKey={messageKey} onRetry={onRetry} />);

    expect(screen.getByText(messages.title)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: messages.retry }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
