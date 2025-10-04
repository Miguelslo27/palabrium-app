/**
 * Tests for useMyStories hook
 * 
 * This hook manages fetching, deleting, and refreshing user's stories.
 */

import { renderHook, waitFor } from '@testing-library/react';
import useMyStories from '@/hooks/useMyStories';
import getClientUserId from '@/lib/getClientUserId';
import type { Story } from '@/types/story';

// Mock dependencies
jest.mock('@/lib/getClientUserId');

const mockGetClientUserId = getClientUserId as jest.MockedFunction<typeof getClientUserId>;

// Mock window.alert
const mockAlert = jest.fn();
global.alert = mockAlert;

// Sample test data
const mockStories: Story[] = [
  {
    _id: 'story1',
    title: 'Test Story 1',
    description: 'Description 1',
    authorId: 'user123',
    chapters: [],
    published: true,
    createdAt: '2024-01-01',
  },
  {
    _id: 'story2',
    title: 'Test Story 2',
    description: 'Description 2',
    authorId: 'user123',
    chapters: [],
    published: false,
    createdAt: '2024-01-02',
  },
];

describe('useMyStories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClientUserId.mockResolvedValue('user123');
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial load', () => {
    it('should start with loading state', () => {
      // Arrange
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => { })); // Never resolves

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      expect(result.current.loading).toBe(true);
      expect(result.current.stories).toEqual([]);
      expect(result.current.unauthorized).toBe(false);
    });

    it('should fetch stories successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStories,
      });

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toEqual(mockStories);
      expect(result.current.unauthorized).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stories/mine',
        expect.objectContaining({
          headers: { 'x-user-id': 'user123' },
        })
      );
    });

    it('should handle unauthorized user', async () => {
      // Arrange
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toEqual([]);
      expect(result.current.unauthorized).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toEqual([]);
    });

    it('should handle non-ok response', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toEqual([]);
    });
  });

  describe('refresh', () => {
    it('should refresh stories', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [mockStories[0]],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        });

      // Act
      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toHaveLength(1);

      await result.current.refresh();

      // Assert
      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should set loading state during refresh', async () => {
      // Arrange - use slow responses to capture loading state
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      (global.fetch as jest.Mock).mockImplementation(async () => {
        await delay(50); // Slow enough to capture loading state
        return {
          ok: true,
          json: async () => mockStories,
        };
      });

      // Act
      const { result } = renderHook(() => useMyStories());

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Trigger refresh
      result.current.refresh();

      // Should be loading now
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Should complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle refresh when user becomes unauthorized', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStories,
      });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // User signs out
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      await result.current.refresh();

      // Assert
      await waitFor(() => {
        expect(result.current.unauthorized).toBe(true);
      });
      expect(result.current.stories).toEqual([]);
    });
  });

  describe('deleteStory', () => {
    it('should delete a story successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(true);
      await waitFor(() => {
        expect(result.current.stories).toHaveLength(1);
      });
      expect(result.current.stories[0]._id).toBe('story2');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stories/story1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'x-user-id': 'user123' },
        })
      );
    });

    it('should handle delete failure with non-ok response', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(false);
      expect(result.current.stories).toHaveLength(2); // No change
    });

    it('should handle delete with network error', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(false);
      expect(result.current.stories).toHaveLength(2); // No change
    });

    it('should show alert when user is not signed in', async () => {
      // Arrange
      mockGetClientUserId.mockResolvedValue('user123');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStories,
      });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // User signs out
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith('You must be signed in to delete a story');
      expect(result.current.stories).toHaveLength(2); // No change
    });
  });

  describe('deleteAll', () => {
    it('should delete all stories successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(true);
      await waitFor(() => {
        expect(result.current.stories).toEqual([]);
      });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stories/mine',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'x-user-id': 'user123' },
        })
      );
    });

    it('should handle deleteAll failure', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(false);
      expect(result.current.stories).toHaveLength(2); // No change
    });

    it('should handle deleteAll with network error', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(false);
      expect(result.current.stories).toHaveLength(2); // No change
    });

    it('should show alert when user is not signed in', async () => {
      // Arrange
      mockGetClientUserId.mockResolvedValue('user123');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStories,
      });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // User signs out
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith('You must be signed in to perform this action');
      expect(result.current.stories).toHaveLength(2); // No change
    });
  });

  describe('component lifecycle', () => {
    it('should handle unmount during fetch', async () => {
      // Arrange
      let resolvePromise: (value: any) => void = () => { };
      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          resolvePromise = resolve;
        });
      });

      // Act
      const { unmount } = renderHook(() => useMyStories());
      unmount();

      // Resolve after unmount
      resolvePromise({
        ok: true,
        json: async () => mockStories,
      });

      // Assert - Should not throw error
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('should maintain referential stability for callbacks', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStories,
      });

      // Act
      const { result, rerender } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstRefresh = result.current.refresh;
      const firstDeleteStory = result.current.deleteStory;
      const firstDeleteAll = result.current.deleteAll;

      rerender();

      // Assert
      expect(result.current.refresh).toBe(firstRefresh);
      expect(result.current.deleteStory).toBe(firstDeleteStory);
      expect(result.current.deleteAll).toBe(firstDeleteAll);
    });
  });

  describe('edge cases', () => {
    it('should handle empty stories array', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toEqual([]);
      expect(result.current.unauthorized).toBe(false);
    });

    it('should handle deleting non-existent story', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories,
        })
        .mockResolvedValueOnce({
          ok: true,
        });

      const { result } = renderHook(() => useMyStories());

      await waitFor(() => {
        expect(result.current.stories).toHaveLength(2);
      });

      // Act
      const success = await result.current.deleteStory('non-existent-id');

      // Assert
      expect(success).toBe(true);
      expect(result.current.stories).toHaveLength(2); // Filter doesn't find it, no change
    });

    it('should handle malformed JSON response', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      // Act
      const { result } = renderHook(() => useMyStories());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      expect(result.current.stories).toEqual([]);
    });
  });
});
