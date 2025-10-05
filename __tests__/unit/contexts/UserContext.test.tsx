/**
 * Tests for UserContext
 * 
 * Tests the UserProvider and useUser hook functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { UserProvider, useUser } from '@/contexts/UserContext';
import getClientUserId from '@/lib/getClientUserId';

// Mock getClientUserId
jest.mock('@/lib/getClientUserId');

const mockGetClientUserId = getClientUserId as jest.MockedFunction<typeof getClientUserId>;

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UserProvider', () => {
    it('should provide initial loading state', () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.userId).toBe(null);
    });

    it('should load userId successfully', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userId).toBe('user-123');
    });

    it('should handle null userId', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userId).toBe(null);
    });

    it('should handle getClientUserId error', async () => {
      mockGetClientUserId.mockRejectedValue(new Error('Failed to load'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.userId).toBe(null);
      expect(consoleSpy).toHaveBeenCalledWith('Error loading user ID:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('isAuthor helper', () => {
    it('should return true when userId matches authorId', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthor('user-123')).toBe(true);
    });

    it('should return false when userId does not match authorId', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthor('user-456')).toBe(false);
    });

    it('should return false when userId is null', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthor('user-123')).toBe(false);
    });

    it('should return false when authorId is null', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthor(null)).toBe(false);
    });

    it('should return false when authorId is undefined', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthor(undefined)).toBe(false);
    });

    it('should memoize isAuthor function based on userId', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const isAuthorFn1 = result.current.isAuthor;

      // Trigger re-render by checking again
      result.current.isAuthor('user-123');

      const isAuthorFn2 = result.current.isAuthor;

      // Should be the same reference (memoized)
      expect(isAuthorFn1).toBe(isAuthorFn2);
    });
  });

  describe('useUser hook', () => {
    it('should throw error when used outside UserProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser must be used within a UserProvider');

      consoleSpy.mockRestore();
    });

    it('should return context value when used within UserProvider', async () => {
      mockGetClientUserId.mockResolvedValue('user-123');

      const { result } = renderHook(() => useUser(), {
        wrapper: UserProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current).toEqual({
        userId: 'user-123',
        loading: false,
        isAuthor: expect.any(Function),
      });
    });
  });
});
