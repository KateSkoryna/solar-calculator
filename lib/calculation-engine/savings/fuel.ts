import type {
  EngineKind,
  FuelKind,
  Prices,
  SavingsOutcome,
} from "@/lib/calculation-engine/types";

const FUEL_BY_ENGINE: Record<EngineKind, FuelKind> = {
  DIESEL: "diesel",
  PETROL: "petrol",
  HYBRID: "diesel",
  ELECTRIC: "grid",
};

export function fuelOfEngine(engineType: EngineKind): FuelKind {
  return FUEL_BY_ENGINE[engineType];
}

export function outcomeForFuel(
  fuel: FuelKind,
  quantity: number,
  prices: Prices,
): SavingsOutcome {
  if (fuel === "diesel") {
    return {
      euros: quantity * prices.dieselPerLitre,
      dieselLitres: quantity,
      petrolLitres: 0,
      gridKwh: 0,
    };
  }

  if (fuel === "petrol") {
    return {
      euros: quantity * prices.petrolPerLitre,
      dieselLitres: 0,
      petrolLitres: quantity,
      gridKwh: 0,
    };
  }

  return {
    euros: quantity * prices.electricityPerKwh,
    dieselLitres: 0,
    petrolLitres: 0,
    gridKwh: quantity,
  };
}
