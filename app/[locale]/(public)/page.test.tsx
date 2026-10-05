import { screen, within } from "@testing-library/react";
import Home from "./page";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import {
  MONTHS_PER_YEAR,
  PAYBACK_HORIZON_YEARS,
} from "@/lib/calculation-engine/constants";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { quickCheckToCalculationInput } from "@/lib/quick-check-mapping";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const homeMessages = englishMessages.home;

function formatEnginePaybackHeadline() {
  const { paybackMonths } = calculate(
    quickCheckToCalculationInput(HOME_EXAMPLE_QUICK_CHECK, ASSUMPTION_SET_V1),
    ASSUMPTION_SET_V1,
  ).scenarios.REALISTIC;
  if (paybackMonths === null) {
    return `Does not pay off within ${PAYBACK_HORIZON_YEARS} years`;
  }
  const formattedYears = new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
  }).format(paybackMonths / MONTHS_PER_YEAR);
  const unit = formattedYears === "1" ? "year" : "years";
  return `Pays off in ${formattedYears} ${unit}`;
}

describe("Home page", () => {
  it("has exactly one h1", () => {
    renderWithIntl(<Home />);

    const topLevelHeadings = screen.getAllByRole("heading", { level: 1 });
    expect(topLevelHeadings).toHaveLength(1);
    expect(topLevelHeadings[0]).toHaveTextContent(homeMessages.title);
  });

  it("links the primary call to action to the calculator", () => {
    renderWithIntl(<Home />);

    expect(
      screen.getByRole("link", { name: homeMessages.cta }),
    ).toHaveAttribute("href", "/en/calculator");
  });

  it("shows the engine's realistic payback for the example", () => {
    renderWithIntl(<Home />);

    expect(screen.getByTestId("home-example-payback")).toHaveTextContent(
      formatEnginePaybackHeadline(),
    );
  });

  it("describes the example it was calculated from", () => {
    renderWithIntl(<Home />);

    const examplePanel = within(screen.getByTestId("home-example"));
    expect(
      examplePanel.getByText(
        `Example · ${HOME_EXAMPLE_QUICK_CHECK.quantity} delivery vans · ${HOME_EXAMPLE_QUICK_CHECK.cityLabel}`,
      ),
    ).toBeInTheDocument();
  });

  it("marks the example figures with a Sample badge", () => {
    renderWithIntl(<Home />);

    expect(
      within(screen.getByTestId("home-example")).getByText(
        homeMessages.example.sampleBadge,
      ),
    ).toBeInTheDocument();
  });

  it("renders the three How it works items", () => {
    renderWithIntl(<Home />);

    const howItWorks = within(
      screen.getByRole("region", { name: homeMessages.howItWorks.title }),
    );
    expect(howItWorks.getAllByRole("listitem")).toHaveLength(3);
    [
      homeMessages.howItWorks.step1Title,
      homeMessages.howItWorks.step2Title,
      homeMessages.howItWorks.step3Title,
    ].forEach((stepTitle) =>
      expect(
        howItWorks.getByRole("heading", { level: 3, name: stepTitle }),
      ).toBeInTheDocument(),
    );
  });

  it("renders the three Built for items", () => {
    renderWithIntl(<Home />);

    const builtFor = within(
      screen.getByRole("region", { name: homeMessages.builtFor.title }),
    );
    expect(builtFor.getAllByRole("listitem")).toHaveLength(3);
  });

  it("draws the decorative brand illustration hidden from assistive technology", () => {
    const { container } = renderWithIntl(<Home />);

    expect(
      container.querySelector("[data-brand-illustration]"),
    ).toHaveAttribute("aria-hidden", "true");
  });
});
