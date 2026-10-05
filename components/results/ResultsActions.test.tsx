import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsActions from "./ResultsActions";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const actionMessages = englishMessages.results.actions;

function stubClipboard(writeText: jest.Mock) {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
}

async function pressShare() {
  await userEvent.click(
    screen.getByRole("button", { name: actionMessages.shareLink }),
  );
}

describe("ResultsActions", () => {
  it("copies the current address and confirms it", async () => {
    renderWithIntl(<ResultsActions />);
    const writeText = jest.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);

    await pressShare();

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByText(actionMessages.linkCopied)).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("explains what to do when copying is blocked", async () => {
    renderWithIntl(<ResultsActions />);
    stubClipboard(jest.fn().mockRejectedValue(new Error("blocked")));

    await pressShare();

    expect(
      await screen.findByText(actionMessages.linkCopyFailed),
    ).toBeInTheDocument();
  });
});
