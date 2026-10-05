import type { Role } from "@/app/generated/prisma/enums";

export interface TeamMember {
  userId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  role: Role;
}
