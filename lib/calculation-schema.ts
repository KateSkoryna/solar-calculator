import { z } from "zod";

export const calculationInputSchema = z.object({
  vehicleId: z.string().min(1),
  notes: z.string().min(1).optional(),
});
