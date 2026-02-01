export const VehicleType = {
  VAN: "van",
  TRUCK: "truck",
  TRAILER: "trailer",
  BUS: "bus",
} as const;

export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const EngineType = {
  DIESEL: "diesel",
  PETROL: "petrol",
  ELECTRIC: "electric",
} as const;

export type EngineType = (typeof EngineType)[keyof typeof EngineType];

export const ParkingType = {
  DEPOT: "depot",
  STREET: "street",
  CUSTOMER_SITE: "customer_site",
  MIXED: "mixed",
} as const;

export type ParkingType = (typeof ParkingType)[keyof typeof ParkingType];

export const SolarPanelPlacement = {
  ROOF: "roof",
  SIDES: "sides",
  BACK: "back",
  ALL_OVER: "all_over",
} as const;

export type SolarPanelPlacement =
  (typeof SolarPanelPlacement)[keyof typeof SolarPanelPlacement];

export const ParkingLocation = {
  OUTDOOR: "outdoor",
  COVERED: "covered",
  INDOOR: "indoor",
  MIXED: "mixed",
} as const;

export type ParkingLocation =
  (typeof ParkingLocation)[keyof typeof ParkingLocation];
