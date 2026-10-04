import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { resolveInputSources } from "@/lib/calculation-engine/resolve-inputs";
import {
  decodeQuickCheck,
  encodeQuickCheck,
  InvalidQuickCheckError,
  quickCheckToCalculationInput,
  quickCheckToVehicleData,
} from "@/lib/quick-check-mapping";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";

const validAnswers: QuickCheckAnswers = {
  vehicleType: "TRUCK",
  quantity: 12,
  cargoType: "CHILLED",
  distanceBand: "REGIONAL",
  idlingFrequency: "SOMETIMES",
  cityLabel: "Berlin",
  countryCode: "DE",
  latitude: 52.52,
  longitude: 13.405,
  parkingType: "DEPOT",
  solarPanelPlacement: "ROOF",
};

function encodeRawJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

describe("encodeQuickCheck and decodeQuickCheck", () => {
  it("round-trips valid answers", () => {
    expect(decodeQuickCheck(encodeQuickCheck(validAnswers))).toEqual(
      validAnswers,
    );
  });

  it("produces URL-safe output", () => {
    expect(encodeQuickCheck(validAnswers)).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("rejects a tampered value", () => {
    const encoded = encodeQuickCheck(validAnswers);
    const tampered = encodeRawJson({ ...validAnswers, quantity: 5000 });

    expect(() => decodeQuickCheck(tampered)).toThrow(InvalidQuickCheckError);
    expect(() => decodeQuickCheck(encoded.slice(0, -6))).toThrow(
      InvalidQuickCheckError,
    );
  });

  it("rejects a non-EU country", () => {
    const encoded = encodeRawJson({ ...validAnswers, countryCode: "US" });

    expect(() => decodeQuickCheck(encoded)).toThrow(InvalidQuickCheckError);
  });

  it.each(["", "not base64 !!", encodeRawJson("just a string")])(
    "rejects malformed input %j",
    (malformed) => {
      expect(() => decodeQuickCheck(malformed)).toThrow(InvalidQuickCheckError);
    },
  );
});

describe("quick check mapping", () => {
  it("marks the vehicle spec values it did not receive as PRESET", () => {
    const input = quickCheckToCalculationInput(validAnswers, ASSUMPTION_SET_V1);
    const sources = resolveInputSources(input);

    expect(sources.energyConsumptionKwhPer100km).toBe("PRESET");
    expect(sources.solarPanelCapacityKw).toBe("PRESET");
    expect(sources.payloadReserveKg).toBe("PRESET");
    expect(sources.maxRoofLoadKg).toBe("PRESET");
    expect(sources.coolingUnitType).toBe("PRESET");
  });

  it("marks exact answers as PROVIDED", () => {
    const input = quickCheckToCalculationInput(
      { ...validAnswers, energyConsumptionKwhPer100km: 30 },
      ASSUMPTION_SET_V1,
    );

    expect(input.energyConsumptionKwhPer100km).toBe(30);
    expect(resolveInputSources(input).energyConsumptionKwhPer100km).toBe(
      "PROVIDED",
    );
  });

  it("derives distance and idling from the answered bands", () => {
    const input = quickCheckToCalculationInput(validAnswers, ASSUMPTION_SET_V1);

    expect(input.averageDailyDistanceKm).toBe(
      ASSUMPTION_SET_V1.distanceBands.REGIONAL.value.realistic,
    );
    expect(input.idleHoursPerDay).toBe(
      ASSUMPTION_SET_V1.idling.hoursPerDay.SOMETIMES.value.realistic,
    );
  });

  it("fills the vehicle record with realistic presets", () => {
    const vehicleData = quickCheckToVehicleData(
      validAnswers,
      ASSUMPTION_SET_V1,
    );

    expect(vehicleData.energyConsumptionKwhPer100km).toBe(
      ASSUMPTION_SET_V1.vehicleTypes.TRUCK.energyUsePer100km.value.realistic,
    );
    expect(vehicleData.country).toBe("DE");
    expect(vehicleData.city).toBe("Berlin");
    expect(vehicleData.quantity).toBe(12);
  });
});
