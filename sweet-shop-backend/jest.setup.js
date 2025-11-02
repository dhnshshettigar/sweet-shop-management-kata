// jest.setup.js

// Require the TypeORM data source file
const { AppDataSource } = require('./src/shared/database/data-source');

// Global setup and teardown for the entire test environment
beforeAll(async () => {
  // 💡 Connect to the PostgreSQL database for testing
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  // 💡 Close the database connection after all tests run
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

// Important for TDD: Clear the database before *each* test file runs
beforeEach(async () => {
    // 💡 FIX: Simplify TRUNCATE syntax and list all tables.
    // We remove 'RESTART IDENTITY' to fix the syntax error.
    // The TRUNCATE command must list tables separated by commas.
    await AppDataSource.query('TRUNCATE TABLE users, sweets CASCADE;'); 
});