/**
 * Tests for useBufferedPagedStories hook - Edge Cases
 * 
 * Tests for edge cases, boundary conditions, and unusual scenarios
 */

import { renderHook, waitFor } from '../../../setup/test-utils';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, mockSuccessfulFetch, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Edge Cases', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should handle empty results', async () => {
    // Arrange
    mockSuccessfulFetch([], 0);

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
    mockSuccessfulFetch(createMockStories(1, 50), 100);

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
    mockSuccessfulFetch(createMockStories(1, 1), 10);

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
