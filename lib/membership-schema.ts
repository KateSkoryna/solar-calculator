import { z } from "zod";
import { Role } from "@/app/generated/prisma/enums";

export const membershipInputSchema = z.object({
  email: z.string().email(),
  role: z.enum(Object.values(Role)),
});

export const membershipUpdateSchema = z.object({
  role: z.enum(Object.values(Role)),
});
