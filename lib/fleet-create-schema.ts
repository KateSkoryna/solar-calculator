import { z } from "zod";

const MIN_COMPANY_NAME_LENGTH = 2;
const MAX_COMPANY_NAME_LENGTH = 80;
const MAX_USER_NAME_LENGTH = 80;

export const fleetCreateSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(MIN_COMPANY_NAME_LENGTH)
    .max(MAX_COMPANY_NAME_LENGTH),
  userName: z.string().trim().min(1).max(MAX_USER_NAME_LENGTH).optional(),
});
