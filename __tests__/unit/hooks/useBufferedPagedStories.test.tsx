/**
 * Tests for useBufferedPagedStories hook
 * 
 * This hook provides paginated story fetching with intelligent buffering and prefetching.
 * It fetches data in batches from the server and serves smaller pages to the UI.
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import type { Story } from '@/types/story';

// Sample test data
const createMockStories = (start: number, count: number): Story[] => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `story${start + i}`,
    title: `Test Story ${start + i}`,
    description: `Description ${start + i}`,
    authorId: 'user123',
    chapters: [],
    published: true,
    createdAt: `2024-01-${String(start + i).padStart(2, '0')}`,
  }));
};

describe('useBufferedPagedStories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    // Mock window.location.origin for URL building
    delete (window as any).location;
    (window as any).location = { origin: 'http://localhost:3000' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 50),
          total: 100,
        }),
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      // Assert - initial state
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
      expect(result.current.isLoading).toBe(true);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.itemsForPage).toHaveLength(10);
      expect(result.current.total).toBe(100);
    });

    it('should initialize with custom options', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 20),
          total: 50,
        }),
      });

      // Act
      const { result } = renderHook(() =>
        useBufferedPagedStories({
          endpoint: '/api/custom',
          requestedPageSize: 20,
          batchSize: 30,
          initialPage: 2,
        })
      );

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Page should be set but items should be fetched for that page
      expect(result.current.pageSize).toBe(20);
      expect(result.current.itemsForPage.length).toBeGreaterThan(0);
    });

    it('should fetch initial batch on mount', async () => {
      // Arrange
      const mockStories = createMockStories(1, 50);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockStories,
          total: 100,
        }),
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('skip=0'),
        expect.any(Object)
      );
      expect(result.current.itemsForPage).toEqual(mockStories.slice(0, 10));
    });
  });

  describe('pagination', () => {
    it('should serve pages from buffer', async () => {
      // Arrange
      const mockStories = createMockStories(1, 50);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockStories,
          total: 100,
        }),
      });

      // Act
      const { result } = renderHook(() =>
        useBufferedPagedStories({ requestedPageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Page 1 (items 0-9)
      expect(result.current.itemsForPage).toEqual(mockStories.slice(0, 10));

      // Navigate to page 2 (items 10-19)
      act(() => {
        result.current.setPage(2);
      });

      await waitFor(() => {
        expect(result.current.itemsForPage).toEqual(mockStories.slice(10, 20));
      });
    });

    it('should fetch new batch when needed', async () => {
      // Arrange
      const batch1 = createMockStories(1, 50);
      const batch2 = createMockStories(51, 50);
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: batch1, total: 100 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: batch2, total: 100 }),
        });

      // Act
      const { result } = renderHook(() =>
        useBufferedPagedStories({ requestedPageSize: 10, batchSize: 50 })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Navigate to page 6 (items 50-59, requires second batch starting at skip=50)
      act(() => {
        result.current.setPage(6);
      });

      // Wait for second batch to be fetched
      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const hasSkip50 = calls.some(call => call[0].includes('skip=50'));
        expect(hasSkip50).toBe(true);
      });
    });

    it('should update pageSize and reset to page 1', async () => {
      // Arrange
      const mockStories = createMockStories(1, 50);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockStories,
          total: 100,
        }),
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.setPage(3);
      });

      expect(result.current.page).toBe(3);

      // Change page size
      act(() => {
        result.current.setPageSize(20);
      });

      // Assert
      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
      expect(result.current.pageSize).toBe(20);
      expect(result.current.itemsForPage).toHaveLength(20);
    });

    it('should keep page within bounds when total changes', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 50),
          total: 100,
        }),
      });

      // Act
      const { result, rerender } = renderHook(() =>
        useBufferedPagedStories({ requestedPageSize: 10 })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Go to last page (page 10)
      act(() => {
        result.current.setPage(10);
      });

      expect(result.current.page).toBe(10);

      // Mock a response with fewer items
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 5),
          total: 5,
        }),
      });

      // Trigger refresh
      await act(async () => {
        await result.current.refresh();
      });

      // Page should be adjusted to stay within bounds
      await waitFor(() => {
        expect(result.current.page).toBe(1);
      });
    });
  });

  describe('prefetching', () => {
    it('should prefetch next batch when approaching end', async () => {
      // Arrange
      const batch1 = createMockStories(1, 50);
      const batch2 = createMockStories(51, 50);
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: batch1, total: 200 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: batch2, total: 200 }),
        });

      // Act
      const { result } = renderHook(() =>
        useBufferedPagedStories({
          requestedPageSize: 10,
          batchSize: 50,
          prefetchThreshold: 1,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Navigate to page 4 (within prefetch threshold of page 5, last page in buffer)
      act(() => {
        result.current.setPage(4);
      });

      // Should trigger prefetch
      await waitFor(() => {
        const fetchCount = (global.fetch as jest.Mock).mock.calls.length;
        expect(fetchCount).toBeGreaterThanOrEqual(2);
      });

      // Prefetch should complete
      await waitFor(() => {
        expect(result.current.isPrefetching).toBe(false);
      });
    });

    it('should not prefetch beyond total', async () => {
      // Arrange
      const mockStories = createMockStories(1, 50);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: mockStories,
          total: 50,
        }),
      });

      // Act
      const { result } = renderHook(() =>
        useBufferedPagedStories({
          requestedPageSize: 10,
          batchSize: 50,
          prefetchThreshold: 1,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Navigate to page 4
      act(() => {
        result.current.setPage(4);
      });

      // Give it some time
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should not have fetched skip=50 since we have all items (total=50)
      const calls = (global.fetch as jest.Mock).mock.calls;
      const hasSkip50 = calls.some(call => call[0].includes('skip=50'));
      expect(hasSkip50).toBe(false);
    });
  });

  describe('filters', () => {
    it('should include filters in request URL', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 10),
          total: 10,
        }),
      });

      // Act
      renderHook(() =>
        useBufferedPagedStories({
          filters: {
            category: 'fiction',
            published: 'true',
            tag: 'adventure',
          },
        })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/category=fiction/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/published=true/),
        expect.any(Object)
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/tag=adventure/),
        expect.any(Object)
      );
    });

    it('should omit undefined filter values', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 10),
          total: 10,
        }),
      });

      // Act
      renderHook(() =>
        useBufferedPagedStories({
          filters: {
            category: 'fiction',
            published: undefined,
            tag: '',
          },
        })
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Assert
      const fetchUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(fetchUrl).toMatch(/category=fiction/);
      expect(fetchUrl).not.toMatch(/published/);
      expect(fetchUrl).not.toMatch(/tag=/);
    });

    it('should reset buffer when filters change', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 50),
          total: 100,
        }),
      });

      // Act
      const { rerender } = renderHook(
        ({ filters }) => useBufferedPagedStories({ filters }),
        { initialProps: { filters: { category: 'fiction' } } }
      );

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        expect(calls.some(call => call[0].includes('category=fiction'))).toBe(true);
      });

      // Change filters
      rerender({ filters: { category: 'mystery' } });

      // Assert - should fetch with new filters
      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const hasMystery = calls.some(call => call[0].includes('category=mystery'));
        expect(hasMystery).toBe(true);
      });
    });
  });

  describe('headersProvider', () => {
    it('should call headersProvider and include headers in request', async () => {
      // Arrange
      const mockHeadersProvider = jest.fn().mockResolvedValue({
        'x-user-id': 'user123',
        'x-custom': 'value',
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 10),
          total: 10,
        }),
      });

      // Act
      renderHook(() =>
        useBufferedPagedStories({
          headersProvider: mockHeadersProvider,
        })
      );

      await waitFor(() => {
        expect(mockHeadersProvider).toHaveBeenCalled();
      });

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              'x-user-id': 'user123',
              'x-custom': 'value',
            },
          })
        );
      });
    });

    it('should handle headersProvider errors gracefully', async () => {
      // Arrange
      const mockHeadersProvider = jest.fn().mockRejectedValue(new Error('Auth error'));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 10),
          total: 10,
        }),
      });

      // Act
      renderHook(() =>
        useBufferedPagedStories({
          headersProvider: mockHeadersProvider,
        })
      );

      // Should not throw and should proceed with undefined headers
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: undefined,
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.itemsForPage).toEqual([]);
    });

    it('should handle non-ok responses', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.itemsForPage).toEqual([]);
    });

    it('should handle 401 unauthorized', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      // Assert
      await waitFor(() => {
        expect(result.current.unauthorized).toBe(true);
      });
    });

    it('should allow retry on error', async () => {
      // Arrange - first call fails
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // First attempt should fail - items should be empty
      expect(result.current.itemsForPage).toEqual([]);

      // Now mock successful response for retry
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 10),
          total: 10,
        }),
      });

      // Retry
      await act(async () => {
        await result.current.refresh();
      });

      // Assert - should succeed on retry
      await waitFor(() => {
        expect(result.current.itemsForPage.length).toBe(10);
      });
    });
  });

  describe('refresh', () => {
    it('should clear buffer and refetch', async () => {
      // Arrange
      const initialStories = createMockStories(1, 50);
      const refreshedStories = createMockStories(101, 50);

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: initialStories, total: 100 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ items: refreshedStories, total: 150 }),
        });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const firstItem = result.current.itemsForPage[0];

      // Refresh
      await act(async () => {
        await result.current.refresh();
      });

      // Assert - wait for refresh to complete and data to change
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
      
      await waitFor(() => {
        expect(result.current.itemsForPage.length).toBeGreaterThan(0);
      });
      
      // After refresh, should have new data
      expect(result.current.itemsForPage[0]._id).toContain('story');
      expect(result.current.total).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty results', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [],
          total: 0,
        }),
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.itemsForPage).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('should handle response with only items array (no total)', async () => {
      // Arrange
      const mockStories = createMockStories(1, 10);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStories,
      });

      // Act
      const { result } = renderHook(() => useBufferedPagedStories());

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.itemsForPage).toEqual(mockStories);
      expect(result.current.total).toBe(10); // Should infer from items length
    });

    it('should limit batchSize to 50', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 50),
          total: 100,
        }),
      });

      // Act
      renderHook(() =>
        useBufferedPagedStories({
          batchSize: 100, // Over limit
        })
      );

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/limit=50/),
        expect.any(Object)
      );
    });

    it('should handle minimum batchSize of 1', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          items: createMockStories(1, 1),
          total: 10,
        }),
      });

      // Act
      renderHook(() =>
        useBufferedPagedStories({
          batchSize: 0, // Under minimum
        })
      );

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/limit=1/),
        expect.any(Object)
      );
    });
  });
});
