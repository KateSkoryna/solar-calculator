import { screen, within } from "@testing-library/react";
import Home from "./page";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import {
  HOW_IT_WORKS_SECTION_ID,
  PRODUCT_SECTION_ID,
  WHY_IT_PAYS_SECTION_ID,
} from "@/lib/public-paths";
import { quickCheckToCalculationInput } from "@/lib/quick-check-mapping";
import { humaniseDuration } from "@/lib/results-view-model";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const homeMessages = englishMessages.home;
const RICH_TEXT_TAG_PATTERN = /<\/?[a-z]+>/g;

function formatEnginePayback() {
  const { paybackMonths } = calculate(
    quickCheckToCalculationInput(HOME_EXAMPLE_QUICK_CHECK, ASSUMPTION_SET_V1),
    ASSUMPTION_SET_V1,
  ).scenarios.REALISTIC;
  if (paybackMonths === null) throw new Error("The example never pays off");

  const { years, months } = humaniseDuration(paybackMonths);
  const yearUnit = years === 1 ? "year" : "years";
  const monthUnit = months === 1 ? "month" : "months";
  return `${years} ${yearUnit} ${months} ${monthUnit}`;
}

describe("Home page", () => {
  it("has exactly one h1", () => {
    renderWithIntl(<Home />);

    const topLevelHeadings = screen.getAllByRole("heading", { level: 1 });
    expect(topLevelHeadings).toHaveLength(1);
    expect(topLevelHeadings[0]).toHaveTextContent(
      homeMessages.title.replace(RICH_TEXT_TAG_PATTERN, ""),
    );
  });

  it("links every estimate call to action to the calculator", () => {
    renderWithIntl(<Home />);

    const estimateLinks = screen.getAllByRole("link", {
      name: homeMessages.cta,
    });
    expect(estimateLinks).toHaveLength(2);
    estimateLinks.forEach((estimateLink) =>
      expect(estimateLink).toHaveAttribute("href", "/en/calculator"),
    );
  });

  it("links the secondary calls to action to the product section and sign-up", () => {
    renderWithIntl(<Home />);

    expect(
      screen.getByRole("link", { name: homeMessages.secondaryCta }),
    ).toHaveAttribute("href", `/en#${PRODUCT_SECTION_ID}`);
    expect(
      screen.getByRole("link", { name: homeMessages.closing.secondaryCta }),
    ).toHaveAttribute("href", "/en/register");
  });

  it("shows the engine's realistic payback in the result showcase", () => {
    renderWithIntl(<Home />);

    expect(screen.getByTestId("home-result-verdict")).toHaveTextContent(
      formatEnginePayback(),
    );
  });

  it("marks the showcase figures as sample data", () => {
    renderWithIntl(<Home />);

    expect(
      screen.getAllByText(homeMessages.sampleData, { exact: false }).length,
    ).toBeGreaterThan(0);
  });

  it("describes every product screen for assistive technology", () => {
    renderWithIntl(<Home />);

    [
      homeMessages.dashboard.screenLabel,
      homeMessages.result.screenLabel,
      homeMessages.features.calculator.previewLabel,
      homeMessages.features.workspace.previewLabel,
      homeMessages.features.team.previewLabel,
      homeMessages.mobile.calculatorLabel,
      homeMessages.mobile.dashboardLabel,
      homeMessages.mobile.resultLabel,
    ].forEach((screenLabel) =>
      expect(
        screen.getByRole("img", { name: screenLabel }),
      ).toBeInTheDocument(),
    );
  });

  it("gives the header anchors a section to land on", () => {
    const { container } = renderWithIntl(<Home />);

    [
      WHY_IT_PAYS_SECTION_ID,
      PRODUCT_SECTION_ID,
      HOW_IT_WORKS_SECTION_ID,
    ].forEach((sectionId) =>
      expect(container.querySelector(`#${sectionId}`)).toBeInTheDocument(),
    );
  });

  it("renders the four reasons it pays for companies", () => {
    renderWithIntl(<Home />);

    const whyItPays = within(
      screen.getByRole("region", { name: homeMessages.whyItPays.title }),
    );
    expect(whyItPays.getAllByRole("listitem")).toHaveLength(4);
  });

  it("renders the four How it works items", () => {
    renderWithIntl(<Home />);

    const howItWorks = within(
      screen.getByRole("region", { name: homeMessages.howItWorks.title }),
    );
    expect(howItWorks.getAllByRole("listitem")).toHaveLength(4);
    [
      homeMessages.howItWorks.step1Title,
      homeMessages.howItWorks.step2Title,
      homeMessages.howItWorks.step3Title,
      homeMessages.howItWorks.step4Title,
    ].forEach((stepTitle) =>
      expect(
        howItWorks.getByRole("heading", { level: 3, name: stepTitle }),
      ).toBeInTheDocument(),
    );
  });

  it("renders the three Built for items", () => {
    renderWithIntl(<Home />);

    const builtFor = within(
      screen.getByRole("region", { name: homeMessages.builtFor.headline }),
    );
    expect(builtFor.getAllByRole("listitem")).toHaveLength(3);
  });

  it("draws the decorative suns hidden from assistive technology", () => {
    const { container } = renderWithIntl(<Home />);

    const brandIllustrations = container.querySelectorAll(
      "[data-brand-illustration]",
    );
    expect(brandIllustrations).toHaveLength(2);
    brandIllustrations.forEach((brandIllustration) =>
      expect(brandIllustration).toHaveAttribute("aria-hidden", "true"),
    );
  });
});
