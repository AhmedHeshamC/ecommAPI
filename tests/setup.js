// Mock the database connection
jest.mock('../src/config/db', () => {
  const mockExecute = jest.fn().mockResolvedValue([[], []]);
  const mockQuery = jest.fn().mockResolvedValue([[], []]);
  const mockRelease = jest.fn();
  const mockBeginTransaction = jest.fn();
  const mockCommit = jest.fn();
  const mockRollback = jest.fn();
  
  const mockPool = {
    execute: mockExecute,
    query: mockQuery,
    getConnection: jest.fn().mockResolvedValue({
      execute: mockExecute,
      release: mockRelease,
      beginTransaction: mockBeginTransaction,
      commit: mockCommit,
      rollback: mockRollback
    })
  };

  // Mock testConnection to return true and avoid console logs
  const testConnection = jest.fn().mockResolvedValue(true);
  
  return {
    ...mockPool,
    testConnection,
    // Expose mocks to tests
    __mocks: {
      execute: mockExecute,
      query: mockQuery,
      getConnection: mockPool.getConnection
    }
  };
});

// Mock the logger to avoid console output during tests
jest.mock('../src/utils/logger.util', () => {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    security: jest.fn(),
    db: jest.fn(),
    formatMessage: jest.fn(),
    writeToFile: jest.fn()
  };
});

// Common setup for all tests
beforeAll(async () => {
  // Optionally: Clean test DB, run migrations, etc.
  // Any additional setup can go here
});

// Cleanup after all tests
afterAll(async () => {
  // Optionally: Close DB connections, cleanup, etc.
  // Close any open handles or connections
});
