import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { Role, VehicleType } from "@/app/generated/prisma/enums";
import CheckEmailPanel from "@/components/auth/CheckEmailPanel";
import SignInPanel from "@/components/auth/SignInPanel";
import CalculatorWizard from "@/components/calculator/CalculatorWizard";
import Heading from "@/components/common/Heading";
import CalculationHistoryList from "@/components/fleet/CalculationHistoryList";
import FleetKpiRow from "@/components/fleet/FleetKpiRow";
import VehicleEditForm from "@/components/fleet/VehicleEditForm";
import VehicleGroupList from "@/components/fleet/VehicleGroupList";
import VehicleList from "@/components/fleet/VehicleList";
import OnboardingForm from "@/components/onboarding/OnboardingForm";
import PublicResults from "@/components/results/PublicResults";
import ResultsView from "@/components/results/ResultsView";
import TeamAndActivityView from "@/components/team/TeamAndActivityView";
import { DISPLAY_TIME_ZONE } from "@/i18n";
import { AuditAction, AuditEntityType } from "@/lib/audit";
import { fetchCities } from "@/lib/geocode-client";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { savePendingSignInEmail } from "@/lib/pending-sign-in-email";
import { encodeQuickCheck } from "@/lib/quick-check-mapping";
import { toResultsViewModel } from "@/lib/results-view-model";
import { NO_COOLING_UNIT } from "@/lib/vehicle-edit-form";
import englishMessages from "@/messages/en.json";
import { expectNoAxeViolations } from "@/test-support/axe";
import { renderWithIntl } from "@/test-support/render-with-intl";
import { calculateOutput } from "@/test-support/results-fixtures";
import { stubChartEnvironment } from "@/test-support/stub-chart-environment";
import Home from "./[locale]/(public)/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: () => ({ status: "unauthenticated" }),
}));

jest.mock("@/lib/geocode-client", () => ({
  ...jest.requireActual("@/lib/geocode-client"),
  CITY_SEARCH_DEBOUNCE_MS: 0,
  fetchCities: jest.fn(),
}));

const BERLIN = {
  name: "Berlin",
  detail: "Germany",
  label: "Berlin, Germany",
  countryCode: "DE" as const,
  latitude: 52.52,
  longitude: 13.405,
};

const OWNER_ID = "user_owner";
const CURRENT_VERSION = "2026.1";

function renderPageWithHeading(
  title: string,
  content: React.ReactElement,
  providers: (children: React.ReactElement) => React.ReactElement = (
    children,
  ) => children,
) {
  return render(
    providers(
      <NextIntlClientProvider
        locale="en"
        timeZone={DISPLAY_TIME_ZONE}
        messages={englishMessages}
      >
        <Heading level={1} size="display-s">
          {title}
        </Heading>
        {content}
      </NextIntlClientProvider>,
    ),
  );
}

function renderWithQueryClient(title: string, content: React.ReactElement) {
  return renderPageWithHeading(title, content, (children) => (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      {children}
    </QueryClientProvider>
  ));
}

async function pressContinue() {
  await userEvent.click(
    screen.getByRole("button", {
      name: englishMessages.calculator.actions.continue,
    }),
  );
}

beforeEach(() => {
  sessionStorage.clear();
  stubChartEnvironment();
  jest.mocked(fetchCities).mockResolvedValue([BERLIN]);
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      events: [
        {
          id: "event_1",
          action: AuditAction.VEHICLE_UPDATED,
          entityType: AuditEntityType.VEHICLE,
          entityId: "vehicle_1",
          metadata: {
            changes: [
              { field: "parkingType", from: "CUSTOMER_SITE", to: "DEPOT" },
            ],
          },
          createdAt: "2026-10-04T09:42:00.000Z",
          actorUser: {
            id: OWNER_ID,
            email: "alice@example.com",
            name: "Alice",
          },
          subjectName: "Scania R450",
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    }),
  });
});

describe("Accessibility: public pages", () => {
  it("Home has no axe violations", async () => {
    const { container } = renderWithIntl(<Home />);

    await expectNoAxeViolations(container);
  });

  it("Login has no axe violations", async () => {
    const { container } = renderWithIntl(<SignInPanel mode="login" />);

    await expectNoAxeViolations(container);
  });

  it("Register has no axe violations", async () => {
    const { container } = renderWithIntl(<SignInPanel mode="register" />);

    await expectNoAxeViolations(container);
  });

  it("Check email has no axe violations", async () => {
    savePendingSignInEmail("maria@example.com");
    const { container } = renderWithIntl(<CheckEmailPanel />);

    await expectNoAxeViolations(container);
  });

  it("Onboarding has no axe violations", async () => {
    const { container } = renderPageWithHeading(
      englishMessages.onboarding.title,
      <OnboardingForm />,
    );

    await expectNoAxeViolations(container);
  });

  it("Results has no axe violations", async () => {
    const { container } = renderWithIntl(
      <PublicResults
        encodedAnswers={encodeQuickCheck(HOME_EXAMPLE_QUICK_CHECK)}
      />,
    );

    await expectNoAxeViolations(container);
  });

  it("Results error state has no axe violations", async () => {
    const { container } = renderWithIntl(<PublicResults />);

    await expectNoAxeViolations(container);
  });
});

describe("Accessibility: calculator steps", () => {
  it("every step has no axe violations", async () => {
    const { container } = renderWithIntl(<CalculatorWizard />);
    await expectNoAxeViolations(container);

    await pressContinue();
    await expectNoAxeViolations(container);

    await pressContinue();
    await expectNoAxeViolations(container);

    await userEvent.type(
      screen.getByRole("combobox", {
        name: englishMessages.calculator.city.label,
      }),
      "Ber",
    );
    await userEvent.click(
      await screen.findByRole("option", { name: /Berlin/ }),
    );
    await expectNoAxeViolations(container);

    await pressContinue();
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: englishMessages.calculator.actions.seeResults,
        }),
      ).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);
  });
});

describe("Accessibility: fleet pages", () => {
  it("fleet Results has no axe violations", async () => {
    const { container } = renderWithIntl(
      <ResultsView
        embedded
        viewModel={toResultsViewModel(calculateOutput())}
      />,
    );

    await expectNoAxeViolations(container);
  });

  it("Dashboard has no axe violations", async () => {
    const { container } = renderPageWithHeading(
      englishMessages.overview.title,
      <>
        <FleetKpiRow
          kpis={{
            couldSaveEurosPerYear: 12000,
            averagePaybackMonths: 52,
            co2AvoidedKgPerYear: 4500,
            calculatedGroupCount: 1,
            groupsWithoutPaybackCount: 0,
            notCalculatedYetCount: 0,
          }}
          vehicleCount={10}
          groupCount={1}
        />
        <VehicleGroupList
          groups={[
            {
              vehicleId: "vehicle_1",
              name: null,
              manufacturer: "Ford",
              model: "Transit",
              vehicleType: VehicleType.VAN,
              city: "Berlin",
              quantity: 10,
              editedAt: null,
              latestCalculation: {
                id: "calc_1",
                calculatedAt: new Date("2026-03-04T10:00:00Z"),
                assumptionSetVersion: CURRENT_VERSION,
                paybackMonths: 52,
                annualSavingsEuros: 1000,
                co2AvoidedKgPerYear: 500,
              },
            },
          ]}
          currentAssumptionSetVersion={CURRENT_VERSION}
          fleetPath="/en/berlin"
          vehiclesPath="/en/berlin/vehicles"
        />
      </>,
    );

    await expectNoAxeViolations(container);
  });

  it("Team & activity has no axe violations", async () => {
    const { container } = renderWithQueryClient(
      englishMessages.audit.title,
      <TeamAndActivityView
        fleetId="fleet_1"
        members={[
          {
            userId: OWNER_ID,
            name: "Alice Owner",
            email: "alice@example.com",
            imageUrl: null,
            role: Role.OWNER,
          },
          {
            userId: "user_viewer",
            name: null,
            email: "carol@example.com",
            imageUrl: null,
            role: Role.VIEWER,
          },
        ]}
        currentUserId={OWNER_ID}
        canManageTeam
        canSeeActivity
      />,
    );
    await screen.findByRole("tablist");

    await expectNoAxeViolations(container);
  });

  it("Vehicles has no axe violations", async () => {
    const { container } = renderPageWithHeading(
      englishMessages.vehicles.title,
      <VehicleList
        vehicles={[
          {
            id: "vehicle_1",
            name: "Berlin delivery vans",
            manufacturer: "Ford",
            model: "Transit",
            vehicleType: "VAN",
            city: "Berlin",
            quantity: 9,
          },
        ]}
        fleetSlug="berlin"
        canEdit
      />,
    );

    await expectNoAxeViolations(container);
  });

  it("Edit vehicle has no axe violations", async () => {
    const { container } = renderWithIntl(
      <VehicleEditForm
        fleetId="fleet_1"
        fleetSlug="berlin"
        vehicleId="vehicle_1"
        vehicleName="Berlin 3 Van"
        canDelete
        initialValues={{
          name: "",
          manufacturer: "Ford",
          model: "Transit",
          vehicleType: "VAN",
          engineType: "DIESEL",
          parkingType: "DEPOT",
          quantity: 3,
          averageDailyDistanceKm: 80,
          energyConsumptionKwhPer100km: 30,
          solarPanelCapacityKw: 1,
          solarPanelPlacement: "ROOF",
          payloadReserveKg: 100,
          maxRoofLoadKg: 150,
          operatingMonthsPerYear: 12,
          winterUsage: true,
          city: "Berlin",
          country: "DE",
          cargoType: "REGULAR",
          idleHoursPerDay: 0,
          coolingUnitType: NO_COOLING_UNIT,
        }}
      />,
    );

    await expectNoAxeViolations(container);
  });

  it("Calculations has no axe violations", async () => {
    const { container } = renderPageWithHeading(
      englishMessages.calculations.title,
      <CalculationHistoryList
        rows={[
          {
            id: "calc_1",
            name: null,
            manufacturer: "Ford",
            model: "Transit",
            vehicleType: "VAN",
            city: "Berlin",
            quantity: 3,
            createdAt: new Date("2026-03-04T10:00:00Z"),
            assumptionSetVersion: CURRENT_VERSION,
            paybackMonths: 52,
            hasResult: true,
            vehicleEditedAt: null,
          },
        ]}
        currentAssumptionSetVersion={CURRENT_VERSION}
        locale="en"
        fleetSlug="berlin"
      />,
    );

    await expectNoAxeViolations(container);
  });
});
