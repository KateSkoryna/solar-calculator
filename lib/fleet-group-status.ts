import type { VehicleType } from "@/app/generated/prisma/enums";

export interface GroupCalculation {
  id: string;
  assumptionSetVersion: string;
  paybackMonths: number | null;
  annualSavingsEuros: number;
  co2AvoidedKgPerYear: number;
}

export interface FleetVehicleGroup {
  vehicleId: string;
  manufacturer: string;
  model: string;
  vehicleType: VehicleType;
  city: string;
  quantity: number;
  latestCalculation: GroupCalculation | null;
}

export function isCalculatedWithCurrentAssumptions(
  group: FleetVehicleGroup,
  currentAssumptionSetVersion: string,
): group is FleetVehicleGroup & { latestCalculation: GroupCalculation } {
  return (
    group.latestCalculation !== null &&
    group.latestCalculation.assumptionSetVersion === currentAssumptionSetVersion
  );
}
