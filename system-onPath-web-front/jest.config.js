/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo/web",
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
};
