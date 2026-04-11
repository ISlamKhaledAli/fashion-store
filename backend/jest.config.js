/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/tests/setup-env.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup-tests.ts"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 1,
  testTimeout: 30000,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
};
