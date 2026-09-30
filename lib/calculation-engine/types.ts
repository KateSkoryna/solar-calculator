import type { EuCountryCode } from "@/lib/assumptions/eu-countries";
import type { CoolingUnitType } from "@/lib/assumptions/types";
import type { AssumptionSet } from "@/lib/assumptions/v1";

export const SCENARIO_KINDS = [
  "PESSIMISTIC",
  "REALISTIC",
  "OPTIMISTIC",
] as const;
export type ScenarioKind = (typeof SCENARIO_KINDS)[number];

export const SAVINGS_TYPES = [
  "COOLING_UNIT_FUEL",
  "LESS_IDLING",
  "FEWER_BATTERY_BREAKDOWNS",
  "ALTERNATOR_FUEL",
  "DIRECT_CHARGING",
] as const;
export type SavingsType = (typeof SAVINGS_TYPES)[number];

export const INPUT_SOURCES = ["PROVIDED", "PRESET", "MEASURED"] as const;
export type InputSource = (typeof INPUT_SOURCES)[number];

export const VEHICLE_TYPES = ["VAN", "TRUCK", "TRAILER", "BUS"] as const;
export type VehicleKind = (typeof VEHICLE_TYPES)[number];

export const ENGINE_TYPES = ["DIESEL", "PETROL", "ELECTRIC", "HYBRID"] as const;
export type EngineKind = (typeof ENGINE_TYPES)[number];

export const PARKING_TYPES = [
  "DEPOT",
  "STREET",
  "CUSTOMER_SITE",
  "MIXED",
] as const;
export type ParkingKind = (typeof PARKING_TYPES)[number];

export const PANEL_PLACEMENTS = ["ROOF", "SIDES", "BACK", "ALL_OVER"] as const;
export type PanelPlacement = (typeof PANEL_PLACEMENTS)[number];

export const CARGO_TYPES = ["REGULAR", "CHILLED", "PASSENGERS"] as const;
export type CargoKind = (typeof CARGO_TYPES)[number];

export interface CalculationInput {
  manufacturer?: string;
  model?: string;
  city?: string;
  vehicleType: VehicleKind;
  engineType: EngineKind;
  parkingType: ParkingKind;
  solarPanelPlacement: PanelPlacement;
  cargoType: CargoKind;
  quantity: number;
  averageDailyDistanceKm: number;
  operatingMonthsPerYear: number;
  winterUsage: boolean;
  countryCode: EuCountryCode;
  latitude: number;
  longitude: number;
  energyConsumptionKwhPer100km?: number;
  solarPanelCapacityKw?: number;
  payloadReserveKg?: number;
  maxRoofLoadKg?: number;
  coolingUnitType?: CoolingUnitType;
  idleHoursPerDay?: number;
  subsidyOverrideCents?: number;
}

export interface ResolvedInput extends Omit<
  CalculationInput,
  | "energyConsumptionKwhPer100km"
  | "solarPanelCapacityKw"
  | "payloadReserveKg"
  | "maxRoofLoadKg"
  | "idleHoursPerDay"
> {
  energyConsumptionKwhPer100km: number;
  solarPanelCapacityKw: number;
  payloadReserveKg: number;
  maxRoofLoadKg: number;
  idleHoursPerDay: number;
}

export type InputSources = Partial<Record<keyof CalculationInput, InputSource>>;

export type SavingsByType = Record<SavingsType, number>;

export interface EnergyAllocation {
  producedKwh: number;
  coolingKwh: number;
  idlingKwh: number;
  auxiliaryKwh: number;
  directChargingKwh: number;
  wastedKwh: number;
}

export interface ScenarioResult {
  kind: ScenarioKind;
  resolvedInput: ResolvedInput;
  annualSavingsCents: number;
  savingsByTypeCents: SavingsByType;
  annualMaintenanceCents: number;
  oneTimeCostBeforeSubsidyCents: number;
  subsidyCents: number;
  oneTimeCostAfterSubsidyCents: number;
  paybackMonths: number | null;
  cumulativeSavingsSeriesCents: number[];
  yearlySolarEnergyKwh: number;
  co2AvoidedKgPerYear: number;
  tenYearNetGainCents: number;
  energy: EnergyAllocation;
}

export interface CalculationOutput {
  formulaVersion: string;
  assumptionSetVersion: string;
  inputSources: InputSources;
  scenarios: Record<ScenarioKind, ScenarioResult>;
}

export interface EnergyDemands {
  coolingKwh: number;
  idlingKwh: number;
  auxiliaryKwh: number;
  directChargingKwh: number;
}

export interface Prices {
  dieselPerLitre: number;
  petrolPerLitre: number;
  electricityPerKwh: number;
}

export interface SavingsContext {
  assumptionSet: AssumptionSet;
  input: ResolvedInput;
  scenario: ScenarioKind;
  prices: Prices;
}

export interface SavingsOutcome {
  euros: number;
  dieselLitres: number;
  petrolLitres: number;
  gridKwh: number;
}

export type FuelKind = "diesel" | "petrol" | "grid";
