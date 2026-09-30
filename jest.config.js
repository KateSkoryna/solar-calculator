import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const API_TEST_FILE_PATTERN = "\\.api\\.test\\.ts$";

const sharedProjectConfig = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

const unitProjectConfig = {
  ...sharedProjectConfig,
  displayName: "unit",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", API_TEST_FILE_PATTERN],
};

const apiProjectConfig = {
  ...sharedProjectConfig,
  displayName: "api",
  testEnvironment: "node",
  testMatch: ["**/*.api.test.ts"],
  globalSetup: "<rootDir>/test-support/api-global-setup.ts",
  globalTeardown: "<rootDir>/test-support/api-global-teardown.ts",
  setupFiles: ["<rootDir>/test-support/api-test-environment.ts"],
};

async function buildApiProject() {
  const resolvedConfig = await createJestConfig(apiProjectConfig)();
  return {
    ...resolvedConfig,
    transformIgnorePatterns: [
      "/node_modules/(?!@prisma/client/runtime/)",
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  };
}

async function buildJestConfig() {
  return {
    projects: [
      await createJestConfig(unitProjectConfig)(),
      await buildApiProject(),
    ],
    collectCoverageFrom: [
      "app/**/*.{js,jsx,ts,tsx}",
      "components/**/*.{js,jsx,ts,tsx}",
      "lib/**/*.{js,jsx,ts,tsx}",
      "!**/*.d.ts",
      "!**/node_modules/**",
      "!**/.next/**",
    ],
  };
}

export default buildJestConfig;
