import type { VehicleType } from "@/app/generated/prisma/enums";
import { ASSUMPTION_SET_V1 } from "@/lib/assumptions/v1";
import { calculate } from "@/lib/calculation-engine";
import { CENTS_PER_EURO } from "@/lib/calculation-engine/constants";
import type { FleetVehicleGroup } from "@/lib/fleet-group-status";
import { aggregateFleetKpis, type FleetKpis } from "@/lib/fleet-kpis";
import { HOME_EXAMPLE_QUICK_CHECK } from "@/lib/home-example";
import { quickCheckToCalculationInput } from "@/lib/quick-check-mapping";
import type { QuickCheckAnswers } from "@/lib/quick-check-schema";
import {
  toResultsViewModel,
  type ResultsViewModel,
} from "@/lib/results-view-model";

export const SHOWCASE_FLEET_NAME = "Nordwind Logistics";
export const SHOWCASE_FLEET_ADDRESS = "solar-calculator.app/nordwind/overview";

const SHOWCASE_CALCULATED_AT = new Date("2026-01-15T09:00:00Z");

interface ShowcaseGroupDefinition {
  manufacturer: string;
  model: string;
  answers: QuickCheckAnswers;
  isCalculated: boolean;
}

const SHOWCASE_GROUP_DEFINITIONS: ShowcaseGroupDefinition[] = [
  {
    manufacturer: "Mercedes",
    model: "Sprinter",
    answers: HOME_EXAMPLE_QUICK_CHECK,
    isCalculated: true,
  },
  {
    manufacturer: "Scania",
    model: "R450",
    answers: {
      vehicleType: "TRUCK",
      quantity: 6,
      cargoType: "REGULAR",
      distanceBand: "LONG",
      idlingFrequency: "OFTEN",
      cityLabel: "Hamburg",
      countryCode: "DE",
      latitude: 53.5511,
      longitude: 9.9937,
      parkingType: "MIXED",
      solarPanelPlacement: "ROOF",
    },
    isCalculated: true,
  },
  {
    manufacturer: "Solaris",
    model: "Urbino 12",
    answers: {
      vehicleType: "BUS",
      quantity: 4,
      cargoType: "PASSENGERS",
      distanceBand: "REGIONAL",
      idlingFrequency: "SOMETIMES",
      cityLabel: "Leipzig",
      countryCode: "DE",
      latitude: 51.3397,
      longitude: 12.3731,
      parkingType: "DEPOT",
      solarPanelPlacement: "ROOF",
    },
    isCalculated: true,
  },
  {
    manufacturer: "Krone",
    model: "Cool Liner",
    answers: {
      vehicleType: "TRAILER",
      quantity: 4,
      cargoType: "CHILLED",
      distanceBand: "LONG",
      idlingFrequency: "OFTEN",
      cityLabel: "Berlin",
      countryCode: "DE",
      latitude: 52.52,
      longitude: 13.405,
      parkingType: "DEPOT",
      solarPanelPlacement: "ROOF",
    },
    isCalculated: false,
  },
];

export interface ShowcaseGroup {
  id: string;
  name: string;
  vehicleType: VehicleType;
  quantity: number;
  city: string;
  paybackMonths: number | null;
  isCalculated: boolean;
}

export interface HomeShowcase {
  result: ResultsViewModel;
  groups: ShowcaseGroup[];
  kpis: FleetKpis;
  vehicleCount: number;
}

function calculateRealistic(answers: QuickCheckAnswers) {
  return calculate(
    quickCheckToCalculationInput(answers, ASSUMPTION_SET_V1),
    ASSUMPTION_SET_V1,
  );
}

function toFleetVehicleGroup(
  { manufacturer, model, answers, isCalculated }: ShowcaseGroupDefinition,
  groupIndex: number,
): FleetVehicleGroup {
  const groupId = `showcase-group-${groupIndex}`;
  const output = isCalculated ? calculateRealistic(answers) : null;
  const realistic = output?.scenarios.REALISTIC;

  return {
    vehicleId: groupId,
    name: null,
    manufacturer,
    model,
    vehicleType: answers.vehicleType,
    city: answers.cityLabel,
    quantity: answers.quantity,
    editedAt: null,
    latestCalculation:
      output && realistic
        ? {
            id: `${groupId}-calculation`,
            calculatedAt: SHOWCASE_CALCULATED_AT,
            assumptionSetVersion: output.assumptionSetVersion,
            paybackMonths: realistic.paybackMonths,
            annualSavingsEuros: realistic.annualSavingsCents / CENTS_PER_EURO,
            co2AvoidedKgPerYear: realistic.co2AvoidedKgPerYear,
          }
        : null,
  };
}

function buildHomeShowcase(): HomeShowcase {
  const fleetGroups = SHOWCASE_GROUP_DEFINITIONS.map(toFleetVehicleGroup);

  return {
    result: toResultsViewModel(calculateRealistic(HOME_EXAMPLE_QUICK_CHECK), {
      distanceBand: HOME_EXAMPLE_QUICK_CHECK.distanceBand,
    }),
    groups: fleetGroups.map((group) => ({
      id: group.vehicleId,
      name: `${group.manufacturer} ${group.model}`,
      vehicleType: group.vehicleType,
      quantity: group.quantity,
      city: group.city,
      paybackMonths: group.latestCalculation?.paybackMonths ?? null,
      isCalculated: group.latestCalculation !== null,
    })),
    kpis: aggregateFleetKpis(fleetGroups, ASSUMPTION_SET_V1.version),
    vehicleCount: fleetGroups.reduce(
      (total, { quantity }) => total + quantity,
      0,
    ),
  };
}

let cachedHomeShowcase: HomeShowcase | null = null;

export function getHomeShowcase(): HomeShowcase {
  cachedHomeShowcase ??= buildHomeShowcase();
  return cachedHomeShowcase;
}
