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

const ES_MODULE_PACKAGES_TO_TRANSFORM = [
  "@prisma/client/runtime",
  "next-intl",
  "use-intl",
];

async function buildProject(projectConfig) {
  const resolvedConfig = await createJestConfig(projectConfig)();
  return {
    ...resolvedConfig,
    transformIgnorePatterns: [
      `/node_modules/(?!(${ES_MODULE_PACKAGES_TO_TRANSFORM.join("|")})/)`,
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  };
}

async function buildJestConfig() {
  return {
    projects: [
      await buildProject(unitProjectConfig),
      await buildProject(apiProjectConfig),
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
