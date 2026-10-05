import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingForm from "./OnboardingForm";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();
const fetchMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const onboardingMessages = englishMessages.onboarding;

function field(label: string) {
  return screen.getByRole("textbox", { name: label });
}

async function pressCreate() {
  await userEvent.click(
    screen.getByRole("button", { name: onboardingMessages.submit }),
  );
}

beforeEach(() => {
  pushMock.mockReset();
  fetchMock.mockReset();
  global.fetch = fetchMock;
});

describe("OnboardingForm", () => {
  it("cannot be submitted without a company", async () => {
    renderWithIntl(<OnboardingForm />);
    await userEvent.type(field(onboardingMessages.userName), "Maria");

    await pressCreate();

    expect(
      await screen.findByText(onboardingMessages.companyRequired),
    ).toBeInTheDocument();
    expect(field(onboardingMessages.companyName)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a one-letter company name", async () => {
    renderWithIntl(<OnboardingForm />);
    await userEvent.type(field(onboardingMessages.companyName), "A");

    await pressCreate();

    expect(
      await screen.findByText(onboardingMessages.companyRequired),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("creates the workspace and continues", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    renderWithIntl(<OnboardingForm />);
    await userEvent.type(field(onboardingMessages.userName), "Maria");
    await userEvent.type(field(onboardingMessages.companyName), "Nordwind");

    await pressCreate();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/en/workspace"));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/fleets",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ companyName: "Nordwind", userName: "Maria" }),
      }),
    );
  });

  it("leaves the name out when it was left empty", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    renderWithIntl(<OnboardingForm />);
    await userEvent.type(field(onboardingMessages.companyName), "Nordwind");

    await pressCreate();

    await waitFor(() => expect(pushMock).toHaveBeenCalled());
    expect(fetchMock.mock.calls[0][1].body).toBe(
      JSON.stringify({ companyName: "Nordwind" }),
    );
  });

  it("shows a form-level message and stays put when saving fails", async () => {
    fetchMock.mockResolvedValue({ ok: false });
    renderWithIntl(<OnboardingForm />);
    await userEvent.type(field(onboardingMessages.companyName), "Nordwind");

    await pressCreate();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      onboardingMessages.error,
    );
    expect(pushMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: onboardingMessages.submit }),
    ).toBeEnabled();
  });
});
