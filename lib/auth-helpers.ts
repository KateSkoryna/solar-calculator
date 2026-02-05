import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export async function verifyCredentials(credentials: Record<string, unknown>) {
  const parsedCredentials = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
    })
    .safeParse(credentials);

  if (!parsedCredentials.success) return null;

  const { email, password } = parsedCredentials.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return null;
  if (!user.password) return null;

  const passwordsMatch = bcrypt.compare(password, user.password);

  if (!passwordsMatch) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
