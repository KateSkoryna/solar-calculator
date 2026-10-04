import {
  clearPendingQuickCheck,
  PENDING_QUICK_CHECK_STORAGE_KEY,
  readPendingQuickCheck,
  savePendingQuickCheck,
} from "@/lib/pending-quick-check";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";

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

afterEach(() => {
  jest.restoreAllMocks();
  sessionStorage.clear();
});

describe("pending quick check storage", () => {
  it("saves, reads and clears the answers", () => {
    expect(savePendingQuickCheck(answers)).toBe(true);
    expect(readPendingQuickCheck()).toEqual(answers);

    expect(clearPendingQuickCheck()).toBe(true);
    expect(readPendingQuickCheck()).toBeNull();
  });

  it("returns null for stored data that fails validation", () => {
    sessionStorage.setItem(PENDING_QUICK_CHECK_STORAGE_KEY, '{"quantity":0}');

    expect(readPendingQuickCheck()).toBeNull();
  });

  it("returns null and does not throw when sessionStorage throws", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    jest.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(readPendingQuickCheck()).toBeNull();
    expect(savePendingQuickCheck(answers)).toBe(false);
    expect(clearPendingQuickCheck()).toBe(false);
  });
});
