/**
 * Tests for useBufferedPagedStories hook - Pagination
 * 
 * Tests for page navigation, batch fetching, and page size changes
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, mockSuccessfulFetch, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Pagination', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should serve pages from buffer', async () => {
    // Arrange
    const mockStories = createMockStories(1, 50);
    mockSuccessfulFetch(mockStories, 100);

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
    mockSuccessfulFetch(mockStories, 100);

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
    mockSuccessfulFetch(createMockStories(1, 50), 100);

    // Act
    const { result } = renderHook(() =>
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
