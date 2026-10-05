import { screen, waitFor } from "@testing-library/react";
import PendingQuickCheckRedirect from "./PendingQuickCheckRedirect";
import {
  PENDING_QUICK_CHECK_COOKIE_NAME,
  savePendingQuickCheck,
} from "@/lib/pending-quick-check";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const FLEET_PATH = "/en/berlin";
const OVERVIEW_PATH = "/en/berlin/overview";

const answers: QuickCheckAnswers = {
  vehicleType: "VAN",
  quantity: 3,
  cargoType: "REGULAR",
  distanceBand: "SHORT",
  idlingFrequency: "RARELY",
  cityLabel: "Hamburg",
  countryCode: "DE",
  latitude: 53.55,
  longitude: 9.99,
  parkingType: "STREET",
  solarPanelPlacement: "ROOF",
};

function renderRedirect() {
  renderWithIntl(
    <PendingQuickCheckRedirect
      fleetId="fleet_1"
      fleetPath={FLEET_PATH}
      overviewPath={OVERVIEW_PATH}
    />,
  );
}

beforeEach(() => {
  replaceMock.mockClear();
  localStorage.clear();
});

describe("PendingQuickCheckRedirect", () => {
  it("saves the waiting result and opens the new calculation", async () => {
    savePendingQuickCheck(answers);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ calculation: { id: "calc_1" } }),
    });

    renderRedirect();

    expect(
      screen.getByText(englishMessages.workspace.savingQuickCheck),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(
        `${FLEET_PATH}/calculations/calc_1`,
      ),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/fleets/fleet_1/quick-checks",
      expect.objectContaining({ method: "POST" }),
    );
    expect(document.cookie).not.toContain(PENDING_QUICK_CHECK_COOKIE_NAME);
  });

  it("goes to the overview and drops the flag when nothing is waiting", async () => {
    document.cookie = `${PENDING_QUICK_CHECK_COOKIE_NAME}=1; path=/`;

    renderRedirect();

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(OVERVIEW_PATH),
    );
    expect(document.cookie).not.toContain(PENDING_QUICK_CHECK_COOKIE_NAME);
  });

  it("goes to the overview when saving fails", async () => {
    savePendingQuickCheck(answers);
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    renderRedirect();

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith(OVERVIEW_PATH),
    );
  });
});
