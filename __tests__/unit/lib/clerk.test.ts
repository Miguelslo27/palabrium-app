/**
 * Tests for clerk module
 * 
 * This module creates and exports a Clerk client instance for server-side usage.
 */

// Mock @clerk/backend
jest.mock('@clerk/backend', () => ({
  createClerkClient: jest.fn(),
}));

describe('clerk', () => {
  let createClerkClientMock: jest.Mock;
  const originalEnv = process.env.CLERK_SECRET_KEY;

  beforeEach(() => {
    jest.resetModules();
    const clerkBackend = require('@clerk/backend');
    createClerkClientMock = clerkBackend.createClerkClient as jest.Mock;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CLERK_SECRET_KEY = originalEnv;
    } else {
      delete process.env.CLERK_SECRET_KEY;
    }
    jest.clearAllMocks();
  });

  describe('client initialization', () => {
    it('should create Clerk client with secret key from environment', () => {
      // Arrange
      process.env.CLERK_SECRET_KEY = 'sk_test_1234567890';
      const mockClient = { users: {}, sessions: {} };
      createClerkClientMock.mockReturnValue(mockClient);

      // Act
      const clerkModule = require('@/lib/clerk');

      // Assert
      expect(createClerkClientMock).toHaveBeenCalledWith({
        secretKey: 'sk_test_1234567890',
      });
      expect(clerkModule.default).toBe(mockClient);
    });

    it('should use empty string if CLERK_SECRET_KEY is not set', () => {
      // Arrange
      delete process.env.CLERK_SECRET_KEY;
      const mockClient = { users: {}, sessions: {} };
      createClerkClientMock.mockReturnValue(mockClient);

      // Act
      const clerkModule = require('@/lib/clerk');

      // Assert
      expect(createClerkClientMock).toHaveBeenCalledWith({
        secretKey: '',
      });
      expect(clerkModule.default).toBe(mockClient);
    });

    it('should export the Clerk client as default', () => {
      // Arrange
      process.env.CLERK_SECRET_KEY = 'sk_test_abc';
      const mockClient = { users: {}, sessions: {} };
      createClerkClientMock.mockReturnValue(mockClient);

      // Act
      const clerkModule = require('@/lib/clerk');

      // Assert
      expect(clerkModule.default).toBeDefined();
      expect(clerkModule.default).toBe(mockClient);
    });

    it('should handle production secret key format', () => {
      // Arrange
      const prodKey = 'sk_live_abcdefghijklmnopqrstuvwxyz123456789';
      process.env.CLERK_SECRET_KEY = prodKey;
      createClerkClientMock.mockReturnValue({});

      // Act
      require('@/lib/clerk');

      // Assert
      expect(createClerkClientMock).toHaveBeenCalledWith({
        secretKey: prodKey,
      });
    });

    it('should handle test secret key format', () => {
      // Arrange
      const testKey = 'sk_test_Y2FzdWFsLW1hcm1vdC04NS5jbGVyay5hY2NvdW50cy5kZXYk';
      process.env.CLERK_SECRET_KEY = testKey;
      createClerkClientMock.mockReturnValue({});

      // Act
      require('@/lib/clerk');

      // Assert
      expect(createClerkClientMock).toHaveBeenCalledWith({
        secretKey: testKey,
      });
    });
  });

  describe('module exports', () => {
    it('should only export default', () => {
      // Arrange
      process.env.CLERK_SECRET_KEY = 'sk_test_123';
      createClerkClientMock.mockReturnValue({});

      // Act
      const clerkModule = require('@/lib/clerk');
      const exports = Object.keys(clerkModule);

      // Assert
      expect(exports).toContain('default');
      expect(exports.length).toBe(1);
    });
  });

  describe('singleton behavior', () => {
    it('should create client instance only once during module load', () => {
      // Arrange
      process.env.CLERK_SECRET_KEY = 'sk_test_singleton';
      createClerkClientMock.mockReturnValue({});

      // Act
      const module1 = require('@/lib/clerk');
      const module2 = require('@/lib/clerk');

      // Assert - createClerkClient should only be called once during initial module load
      expect(createClerkClientMock).toHaveBeenCalledTimes(1);
      expect(module1.default).toBe(module2.default);
    });
  });
});
