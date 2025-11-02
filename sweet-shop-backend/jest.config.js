// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Look for E2E test files in the 'test' directory
  testMatch: ["<rootDir>/test/**/*.e2e-spec.ts"], 
  // Runs the setup file to handle DB connection/cleanup
  setupFilesAfterEnv: ["./jest.setup.js"],
};