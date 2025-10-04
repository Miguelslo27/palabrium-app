/**
 * Tests for getClientUserId utility
 */

import getClientUserId from '@/lib/getClientUserId';
import getClerkClient from '@/lib/clerk-client';

// Mock the clerk-client module
jest.mock('@/lib/clerk-client');

const mockGetClerkClient = getClerkClient as jest.MockedFunction<typeof getClerkClient>;

describe('getClientUserId', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear window.__USER_ID__ if it exists
    if (typeof window !== 'undefined') {
      delete (window as any).__USER_ID__;
    }
  });

  describe('when Clerk client is available', () => {
    it('should return user ID from clerk.user.id', async () => {
      // Arrange
      const mockClerk = {
        load: jest.fn().mockResolvedValue(undefined),
        user: { id: 'user_12345' },
      };
      mockGetClerkClient.mockReturnValue(mockClerk as any);

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBe('user_12345');
      expect(mockClerk.load).toHaveBeenCalled();
    });

    it('should return user ID from clerk.client.user.id if clerk.user is not available', async () => {
      // Arrange
      const mockClerk = {
        load: jest.fn().mockResolvedValue(undefined),
        client: { user: { id: 'user_67890' } },
      };
      mockGetClerkClient.mockReturnValue(mockClerk as any);

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBe('user_67890');
    });

    it('should return null if no user ID is found in Clerk', async () => {
      // Arrange
      const mockClerk = {
        load: jest.fn().mockResolvedValue(undefined),
      };
      mockGetClerkClient.mockReturnValue(mockClerk as any);

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBeNull();
    });

    it('should handle when clerk.load is not a function', async () => {
      // Arrange
      const mockClerk = {
        user: { id: 'user_11111' },
      };
      mockGetClerkClient.mockReturnValue(mockClerk as any);

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBe('user_11111');
    });
  });

  describe('when Clerk client throws an error', () => {
    it('should fallback to window.__USER_ID__ if available', async () => {
      // Arrange
      mockGetClerkClient.mockImplementation(() => {
        throw new Error('Clerk not initialized');
      });
      if (typeof window !== 'undefined') {
        (window as any).__USER_ID__ = 'user_fallback';
      }

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBe('user_fallback');
    });

    it('should return null if window.__USER_ID__ is not available', async () => {
      // Arrange
      mockGetClerkClient.mockImplementation(() => {
        throw new Error('Clerk not initialized');
      });

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should convert numeric user ID to string', async () => {
      // Arrange
      const mockClerk = {
        load: jest.fn().mockResolvedValue(undefined),
        user: { id: 12345 as any },
      };
      mockGetClerkClient.mockReturnValue(mockClerk as any);

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBe('12345');
      expect(typeof userId).toBe('string');
    });

    it('should handle undefined user object', async () => {
      // Arrange
      const mockClerk = {
        load: jest.fn().mockResolvedValue(undefined),
        user: undefined,
      };
      mockGetClerkClient.mockReturnValue(mockClerk as any);

      // Act
      const userId = await getClientUserId();

      // Assert
      expect(userId).toBeNull();
    });
  });
});
