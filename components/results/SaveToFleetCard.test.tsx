import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SaveToFleetCard from "./SaveToFleetCard";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { readPendingQuickCheck } from "@/lib/pending-quick-check";
import {
  englishMessages,
  renderWithIntl,
} from "@/test-support/render-with-intl";

const pushMock = jest.fn();
const useSessionMock = jest.fn();
const fetchMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => useSessionMock(),
}));

const saveMessages = englishMessages.results.save;
const inputLabels = englishMessages.results.howWeCalculated.inputs;

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body };
}

async function pressSave() {
  renderWithIntl(<SaveToFleetCard answers={HOME_EXAMPLE_QUICK_CHECK} />);
  await userEvent.click(
    screen.getByRole("button", { name: saveMessages.button }),
  );
}

beforeEach(() => {
  pushMock.mockReset();
  fetchMock.mockReset();
  sessionStorage.clear();
  global.fetch = fetchMock;
});

describe("SaveToFleetCard", () => {
  it("names the typical values a saved result lets the visitor replace", () => {
    useSessionMock.mockReturnValue({ status: "unauthenticated" });
    renderWithIntl(
      <SaveToFleetCard
        answers={HOME_EXAMPLE_QUICK_CHECK}
        typicalValueInputs={["solarPanelCapacityKw", "maxRoofLoadKg"]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: saveMessages.preciseTitle }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual([inputLabels.solarPanelCapacityKw, inputLabels.maxRoofLoadKg]);
    expect(screen.getByText(saveMessages.preciseText)).toBeInTheDocument();
  });

  it("keeps the plain invitation when every value came from the visitor", () => {
    useSessionMock.mockReturnValue({ status: "unauthenticated" });
    renderWithIntl(<SaveToFleetCard answers={HOME_EXAMPLE_QUICK_CHECK} />);

    expect(
      screen.getByRole("heading", { name: saveMessages.title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("keeps the answers and sends a signed-out visitor to register", async () => {
    useSessionMock.mockReturnValue({ status: "unauthenticated" });

    await pressSave();

    expect(readPendingQuickCheck()).toEqual(HOME_EXAMPLE_QUICK_CHECK);
    expect(pushMock).toHaveBeenCalledWith("/en/register");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("saves to the first fleet and opens the saved calculation", async () => {
    useSessionMock.mockReturnValue({ status: "authenticated" });
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          fleets: [
            { id: "fleet_1", slug: "berlin" },
            { id: "fleet_2", slug: "madrid" },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ calculation: { id: "calc_1" } }));

    await pressSave();

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/en/berlin/calculations/calc_1"),
    );
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/fleets/fleet_1/quick-checks",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(HOME_EXAMPLE_QUICK_CHECK),
      }),
    );
  });

  it("sends a signed-in user without a fleet to the workspace", async () => {
    useSessionMock.mockReturnValue({ status: "authenticated" });
    fetchMock.mockResolvedValueOnce(jsonResponse({ fleets: [] }));

    await pressSave();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/en/workspace"));
    expect(readPendingQuickCheck()).toEqual(HOME_EXAMPLE_QUICK_CHECK);
  });

  it("shows an error and allows a retry when saving fails", async () => {
    useSessionMock.mockReturnValue({ status: "authenticated" });
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false));

    await pressSave();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      saveMessages.failed,
    );
    expect(
      screen.getByRole("button", { name: saveMessages.button }),
    ).toBeEnabled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
