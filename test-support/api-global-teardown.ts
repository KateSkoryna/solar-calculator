import { dropTestDatabase } from "./test-database";

export default async function teardownApiTestDatabase() {
  await dropTestDatabase();
}
