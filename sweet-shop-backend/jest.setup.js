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
    // Only truncate the 'users' table for now
    // We use TRUNCATE with RESTART IDENTITY to reset auto-increment IDs
    await AppDataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE;');
});