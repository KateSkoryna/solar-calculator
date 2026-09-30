import { createFreshTestDatabase } from "./test-database";

export default async function setupApiTestDatabase() {
  await createFreshTestDatabase();
}
