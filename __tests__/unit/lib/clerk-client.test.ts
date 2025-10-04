/**
 * Tests for clerk-client module
 * 
 * Note: Since this module uses a singleton pattern, we need to carefully
 * manage the module state between tests.
 */

describe('clerk-client', () => {
  // Store original env
  const originalEnv = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  let consoleErrorSpy: jest.SpyInstance;
  let clerkClientModule: any;
  let MockedClerk: jest.Mock;

  beforeEach(() => {
    // Clear the module cache to reset singleton
    jest.resetModules();

    // Setup console.error spy
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock @clerk/clerk-js before requiring the module
    MockedClerk = jest.fn().mockImplementation(() => ({
      load: jest.fn(),
    }));

    jest.doMock('@clerk/clerk-js', () => ({
      Clerk: MockedClerk,
    }));
  });

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore();

    // Restore original env
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = originalEnv;

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getClerkClient', () => {
    it('should create Clerk instance with publishable key from env', () => {
      // Arrange
      const publishableKey = 'pk_test_1234567890';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;

      // Act
      clerkClientModule = require('@/lib/clerk-client');
      clerkClientModule.getClerkClient();

      // Assert
      expect(MockedClerk).toHaveBeenCalledWith(publishableKey, { load: true });
      expect(MockedClerk).toHaveBeenCalledTimes(1);
    });

    it('should return singleton instance on subsequent calls', () => {
      // Arrange
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_singleton';
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      const instance1 = clerkClientModule.getClerkClient();
      const instance2 = clerkClientModule.getClerkClient();
      const instance3 = clerkClientModule.getClerkClient();

      // Assert - Clerk constructor should only be called once
      expect(MockedClerk).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should use empty string if publishable key is not set', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert
      expect(MockedClerk).toHaveBeenCalledWith('', { load: true });
    });

    it('should log error when publishable key is not set', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Clerk client may not initialize correctly.'
      );
    });

    it('should not log error when publishable key is set', () => {
      // Arrange
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_valid';
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should pass load option to Clerk constructor', () => {
      // Arrange
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_load';
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert
      expect(MockedClerk).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ load: true })
      );
    });

    it('should handle empty string as publishable key', () => {
      // Arrange
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert
      expect(MockedClerk).toHaveBeenCalledWith('', { load: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('default export', () => {
    it('should export getClerkClient as default', () => {
      // Arrange
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_export';
      clerkClientModule = require('@/lib/clerk-client');

      // Act & Assert
      expect(clerkClientModule.default).toBe(clerkClientModule.getClerkClient);
    });
  });

  describe('integration scenarios', () => {
    it('should work with typical production publishable key format', () => {
      // Arrange
      const prodKey = 'pk_live_abcdefghijklmnopqrstuvwxyz123456789';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = prodKey;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      const client = clerkClientModule.getClerkClient();

      // Assert
      expect(client).toBeDefined();
      expect(MockedClerk).toHaveBeenCalledWith(prodKey, { load: true });
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should work with test publishable key format', () => {
      // Arrange
      const testKey = 'pk_test_Y2FzdWFsLW1hcm1vdC04NS5jbGVyay5hY2NvdW50cy5kZXYk';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = testKey;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      const client = clerkClientModule.getClerkClient();

      // Assert
      expect(client).toBeDefined();
      expect(MockedClerk).toHaveBeenCalledWith(testKey, { load: true });
    });

    it('should handle whitespace in publishable key', () => {
      // Arrange - Someone might accidentally add whitespace
      const keyWithSpaces = '  pk_test_key_with_spaces  ';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = keyWithSpaces;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert - Should use the key as-is (not trimmed)
      expect(MockedClerk).toHaveBeenCalledWith(keyWithSpaces, { load: true });
    });
  });

  describe('edge cases', () => {
    it('should handle undefined environment variable', () => {
      // Arrange
      delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      clerkClientModule.getClerkClient();

      // Assert
      expect(MockedClerk).toHaveBeenCalledWith('', { load: true });
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should create instance even with invalid key format', () => {
      // Arrange - Invalid format but should still create instance
      const invalidKey = 'not-a-valid-clerk-key';
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = invalidKey;
      clerkClientModule = require('@/lib/clerk-client');

      // Act
      const client = clerkClientModule.getClerkClient();

      // Assert
      expect(client).toBeDefined();
      expect(MockedClerk).toHaveBeenCalledWith(invalidKey, { load: true });
    });
  });
});
