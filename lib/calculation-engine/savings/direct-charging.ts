import { NO_SAVINGS } from "@/lib/calculation-engine/constants";
import type {
  SavingsContext,
  SavingsOutcome,
} from "@/lib/calculation-engine/types";
import { outcomeForFuel } from "@/lib/calculation-engine/savings/fuel";

export function directChargingSavings(
  allocatedKwh: number,
  { prices }: SavingsContext,
): SavingsOutcome {
  if (allocatedKwh <= 0) return NO_SAVINGS;

  return outcomeForFuel("grid", allocatedKwh, prices);
}
