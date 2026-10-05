import { screen } from "@testing-library/react";
import PublicResults from "./PublicResults";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { encodeQuickCheck } from "@/lib/quick-check-mapping";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";
import { stubChartEnvironment } from "@/test-support/stub-chart-environment";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ status: "unauthenticated" }),
}));

const resultsMessages = englishMessages.results;

beforeEach(() => {
  stubChartEnvironment();
});

function expectErrorState() {
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: resultsMessages.error.title,
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: resultsMessages.error.action }),
  ).toHaveAttribute("href", "/en/calculator");
}

describe("PublicResults", () => {
  it("renders the error state for an invalid answers value", () => {
    renderWithIntl(<PublicResults encodedAnswers="not-a-real-answer" />);

    expectErrorState();
  });

  it("renders the error state when answers are missing", () => {
    renderWithIntl(<PublicResults />);

    expectErrorState();
  });

  it("renders the error state for answers that fail validation", () => {
    const encodedAnswers = encodeQuickCheck({
      ...HOME_EXAMPLE_QUICK_CHECK,
      quantity: 0,
    });

    renderWithIntl(<PublicResults encodedAnswers={encodedAnswers} />);

    expectErrorState();
  });

  it("renders the verdict, tiles and actions for valid answers", () => {
    renderWithIntl(
      <PublicResults
        encodedAnswers={encodeQuickCheck(HOME_EXAMPLE_QUICK_CHECK)}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByText(/10 × Van · Regional · Berlin/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(resultsMessages.tiles.tenYearGain),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: resultsMessages.save.button }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: resultsMessages.actions.changeAnswers }),
    ).toHaveAttribute("href", "/en/calculator");
  });
});
