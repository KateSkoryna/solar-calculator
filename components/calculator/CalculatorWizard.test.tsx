import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalculatorWizard from "./CalculatorWizard";
import { CALCULATOR_ANSWERS_STORAGE_KEY } from "@/lib/calculator-storage";
import { fetchCities } from "@/lib/geocode-client";
import { decodeQuickCheck } from "@/lib/quick-check-mapping";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/lib/geocode-client", () => ({
  ...jest.requireActual("@/lib/geocode-client"),
  CITY_SEARCH_DEBOUNCE_MS: 0,
  fetchCities: jest.fn(),
}));

const calculatorMessages = englishMessages.calculator;
const mockedFetchCities = jest.mocked(fetchCities);

const BERLIN = {
  name: "Berlin",
  detail: "Germany",
  label: "Berlin, Germany",
  countryCode: "DE" as const,
  latitude: 52.52,
  longitude: 13.405,
};

const DEFAULT_ANSWERS_WITH_BERLIN = {
  vehicleType: "VAN",
  quantity: 1,
  cargoType: "REGULAR",
  distanceBand: "REGIONAL",
  idlingFrequency: "RARELY",
  parkingType: "DEPOT",
  solarPanelPlacement: "ROOF",
  cityLabel: BERLIN.label,
  countryCode: BERLIN.countryCode,
  latitude: BERLIN.latitude,
  longitude: BERLIN.longitude,
};

function questionHeading(stepKey: keyof typeof calculatorMessages.stepContent) {
  return screen.getByRole("heading", {
    level: 1,
    name: calculatorMessages.stepContent[stepKey].title,
  });
}

async function pressContinue() {
  await userEvent.click(
    screen.getByRole("button", { name: calculatorMessages.actions.continue }),
  );
}

async function chooseBerlin() {
  await userEvent.type(
    screen.getByRole("combobox", { name: calculatorMessages.city.label }),
    "Ber",
  );
  await userEvent.click(await screen.findByRole("option", { name: /Berlin/ }));
}

async function goToLocationStep() {
  await pressContinue();
  await pressContinue();
  await waitFor(() => expect(questionHeading("location")).toHaveFocus());
}

beforeEach(() => {
  sessionStorage.clear();
  pushMock.mockReset();
  mockedFetchCities.mockReset();
  mockedFetchCities.mockResolvedValue([BERLIN]);
});

describe("CalculatorWizard", () => {
  it("shows the defaults as visibly selected on the first step", () => {
    renderWithIntl(<CalculatorWizard />);

    expect(questionHeading("vehicles")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^Van/ })).toBeChecked();
    expect(
      screen.getByRole("radio", {
        name: calculatorMessages.options.cargoType.REGULAR,
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("textbox", { name: calculatorMessages.quantity.label }),
    ).toHaveValue("1");
  });

  it("reaches the results with the defaults plus a city after four Continue presses", async () => {
    renderWithIntl(<CalculatorWizard />);

    await goToLocationStep();
    await chooseBerlin();
    await pressContinue();
    await waitFor(() => expect(questionHeading("panels")).toHaveFocus());
    await userEvent.click(
      screen.getByRole("button", {
        name: calculatorMessages.actions.seeResults,
      }),
    );

    await waitFor(() => expect(pushMock).toHaveBeenCalledTimes(1));
    const resultsUrl = new URL(pushMock.mock.calls[0][0], "http://localhost");
    expect(resultsUrl.pathname).toBe("/en/results");
    expect(
      decodeQuickCheck(resultsUrl.searchParams.get("answers") ?? ""),
    ).toEqual(DEFAULT_ANSWERS_WITH_BERLIN);
  });

  it("moves focus to the new question after each step change", async () => {
    renderWithIntl(<CalculatorWizard />);

    await pressContinue();
    await waitFor(() => expect(questionHeading("dailyDriving")).toHaveFocus());

    await pressContinue();
    await waitFor(() => expect(questionHeading("location")).toHaveFocus());

    await userEvent.click(
      screen.getByRole("button", { name: calculatorMessages.actions.back }),
    );
    await waitFor(() => expect(questionHeading("dailyDriving")).toHaveFocus());
  });

  it("announces the new step in a polite live region", async () => {
    const { container } = renderWithIntl(<CalculatorWizard />);
    const liveRegion = container.querySelector('p[aria-live="polite"].sr-only');
    expect(liveRegion).toHaveTextContent("");

    await pressContinue();

    expect(liveRegion).toHaveTextContent("Step 2 of 4: Daily driving");
  });

  it("refuses to leave the location step without a city and focuses the city field", async () => {
    renderWithIntl(<CalculatorWizard />);
    await goToLocationStep();

    await pressContinue();

    const cityField = screen.getByRole("combobox", {
      name: calculatorMessages.city.label,
    });
    expect(questionHeading("location")).toBeInTheDocument();
    expect(screen.getByText(calculatorMessages.city.required)).toBeVisible();
    expect(cityField).toHaveAttribute("aria-invalid", "true");
    expect(cityField).toHaveFocus();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("keeps the answers across an unmount and remount", async () => {
    const firstRender = renderWithIntl(<CalculatorWizard />);
    await userEvent.click(screen.getByRole("radio", { name: /^Truck/ }));
    await userEvent.click(
      screen.getByRole("button", {
        name: calculatorMessages.quantity.increase,
      }),
    );
    await waitFor(() =>
      expect(sessionStorage.getItem(CALCULATOR_ANSWERS_STORAGE_KEY)).toContain(
        '"TRUCK"',
      ),
    );
    firstRender.unmount();

    renderWithIntl(<CalculatorWizard />);

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: /^Truck/ })).toBeChecked(),
    );
    expect(
      screen.getByRole("textbox", { name: calculatorMessages.quantity.label }),
    ).toHaveValue("2");
  });

  it("reveals the cooling unit field in the exact numbers for chilled cargo", async () => {
    renderWithIntl(<CalculatorWizard />);
    const coolingUnitQuestion = calculatorMessages.questions.coolingUnitType;

    await pressContinue();
    await waitFor(() => expect(questionHeading("dailyDriving")).toHaveFocus());
    expect(
      screen.queryByRole("radiogroup", { name: coolingUnitQuestion }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: calculatorMessages.actions.back }),
    );
    await userEvent.click(
      screen.getByRole("radio", {
        name: calculatorMessages.options.cargoType.CHILLED,
      }),
    );
    await pressContinue();

    const exactNumbers = screen
      .getByText(calculatorMessages.exactNumbers.summary)
      .closest("details");
    expect(exactNumbers).not.toBeNull();
    expect(
      within(exactNumbers as HTMLElement).getByRole("radiogroup", {
        name: coolingUnitQuestion,
      }),
    ).toBeInTheDocument();
  });

  it("blocks Continue and opens the exact numbers when one of them is invalid", async () => {
    renderWithIntl(<CalculatorWizard />);
    await pressContinue();
    await waitFor(() => expect(questionHeading("dailyDriving")).toHaveFocus());

    await userEvent.type(
      screen.getByRole("textbox", {
        name: calculatorMessages.exactNumbers.operatingMonthsPerYear.label,
      }),
      "40",
    );
    await pressContinue();

    const monthsField = screen.getByRole("textbox", {
      name: calculatorMessages.exactNumbers.operatingMonthsPerYear.label,
    });
    const exactNumbers = screen
      .getByText(calculatorMessages.exactNumbers.summary)
      .closest("details");
    expect(
      await screen.findByText(calculatorMessages.exactNumbers.invalidNumber),
    ).toBeInTheDocument();
    expect(questionHeading("dailyDriving")).toBeInTheDocument();
    await waitFor(() => expect(monthsField).toHaveFocus());
    expect(exactNumbers).toHaveAttribute("open");

    (exactNumbers as HTMLDetailsElement).open = false;
    await pressContinue();

    await waitFor(() => expect(exactNumbers).toHaveAttribute("open"));
  });

  it("shows the answers so far in the answers panel", async () => {
    renderWithIntl(<CalculatorWizard />);

    const answersPanel = within(
      screen.getByRole("complementary", {
        name: calculatorMessages.answers.title,
      }),
    );

    expect(answersPanel.getAllByText("1 × Van").length).toBeGreaterThan(0);
    expect(
      answersPanel.getAllByText(calculatorMessages.answers.unanswered).length,
    ).toBeGreaterThan(0);
  });

  it("drops the city error as soon as a city is chosen", async () => {
    renderWithIntl(<CalculatorWizard />);
    await goToLocationStep();
    await pressContinue();
    expect(screen.getByText(calculatorMessages.city.required)).toBeVisible();

    await chooseBerlin();

    expect(
      screen.queryByText(calculatorMessages.city.required),
    ).not.toBeInTheDocument();
  });

  it("keeps the valid answers when one exact number is invalid at reload", async () => {
    const firstRender = renderWithIntl(<CalculatorWizard />);
    await userEvent.click(screen.getByRole("radio", { name: /^Truck/ }));
    await pressContinue();
    await userEvent.type(
      screen.getByRole("textbox", {
        name: calculatorMessages.exactNumbers.operatingMonthsPerYear.label,
      }),
      "40",
    );
    await waitFor(() =>
      expect(sessionStorage.getItem(CALCULATOR_ANSWERS_STORAGE_KEY)).toContain(
        '"TRUCK"',
      ),
    );
    firstRender.unmount();

    renderWithIntl(<CalculatorWizard />);

    await waitFor(() =>
      expect(screen.getByRole("radio", { name: /^Truck/ })).toBeChecked(),
    );
  });
});
