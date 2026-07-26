import { z } from "zod";
import { AuditEntityType } from "@/lib/audit";
import { DEFAULT_AUDIT_EVENT_PAGE_SIZE } from "@/lib/audit-event-constants";

export const auditEventQuerySchema = z
  .object({
    actorUserId: z.string().min(1).optional(),
    entityType: z.enum(Object.values(AuditEntityType)).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(DEFAULT_AUDIT_EVENT_PAGE_SIZE),
  })
  .refine((data) => !data.from || !data.to || data.from <= data.to, {
    message: "from must be before or equal to to",
    path: ["from"],
  });
