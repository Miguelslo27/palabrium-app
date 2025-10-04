/**
 * Tests for useBufferedPagedStories hook - Prefetching
 * 
 * Tests for intelligent prefetching behavior
 */

import { renderHook, waitFor, act } from '../../../setup/test-utils';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Prefetching', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

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
