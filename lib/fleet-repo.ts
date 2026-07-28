import { prisma } from "@/lib/prisma";

export function findFleetBySlug(slug: string) {
  return prisma.fleet.findUnique({ where: { slug } });
}
