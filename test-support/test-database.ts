import "dotenv/config";
import { execSync } from "node:child_process";
import { Client } from "pg";

function deriveTestDatabaseUrl(): URL {
  if (process.env.TEST_DATABASE_URL) {
    return new URL(process.env.TEST_DATABASE_URL);
  }
  const testUrl = new URL(process.env.DATABASE_URL as string);
  testUrl.pathname = `${testUrl.pathname}${TEST_DATABASE_SUFFIX}`;
  return testUrl;
}

const TEST_DATABASE_SUFFIX = "_test";

function getTestDatabaseName(): string {
  const testDatabaseName = deriveTestDatabaseUrl().pathname.slice(1);
  if (!testDatabaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(
      `Refusing to touch database "${testDatabaseName}": test database names must end with "${TEST_DATABASE_SUFFIX}"`,
    );
  }
  return testDatabaseName;
}

function getAdminDatabaseUrl(): string {
  const adminUrl = deriveTestDatabaseUrl();
  adminUrl.pathname = "/postgres";
  return adminUrl.toString();
}

async function withAdminConnection<T>(run: (admin: Client) => Promise<T>) {
  const admin = new Client({ connectionString: getAdminDatabaseUrl() });
  await admin.connect();
  try {
    return await run(admin);
  } finally {
    await admin.end();
  }
}

async function terminateActiveConnectionsToTestDatabase(admin: Client) {
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [getTestDatabaseName()],
  );
}

export function getTestDatabaseUrl(): string {
  return deriveTestDatabaseUrl().toString();
}

export async function createFreshTestDatabase() {
  const testDatabaseUrl = getTestDatabaseUrl();
  const testDatabaseName = getTestDatabaseName();

  await withAdminConnection(async (admin) => {
    await terminateActiveConnectionsToTestDatabase(admin);
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);
    await admin.query(`CREATE DATABASE "${testDatabaseName}"`);
  });

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "pipe",
  });

  process.env.TEST_DATABASE_URL = testDatabaseUrl;
}

export async function dropTestDatabase() {
  const testDatabaseName = getTestDatabaseName();

  await withAdminConnection(async (admin) => {
    await terminateActiveConnectionsToTestDatabase(admin);
    await admin.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);
  });
}
