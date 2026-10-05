export type VehicleChangeValue = string | number | boolean | null;

export type VehicleFieldChange = {
  field: string;
  from: VehicleChangeValue;
  to: VehicleChangeValue;
};

function toChangeValue(value: unknown): VehicleChangeValue {
  const isPrimitive =
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";
  return isPrimitive ? value : null;
}

export function buildVehicleChanges(
  existingVehicle: Record<string, unknown>,
  updates: Record<string, unknown>,
): VehicleFieldChange[] {
  return Object.entries(updates)
    .filter(
      ([field, newValue]) =>
        newValue !== undefined && existingVehicle[field] !== newValue,
    )
    .map(([field, newValue]) => ({
      field,
      from: toChangeValue(existingVehicle[field]),
      to: toChangeValue(newValue),
    }));
}
