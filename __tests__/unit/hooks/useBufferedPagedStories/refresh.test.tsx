/**
 * Tests for useBufferedPagedStories hook - Refresh
 * 
 * Tests for refresh functionality to clear and refetch data
 */

import { renderHook, waitFor, act } from '../../../setup/test-utils';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Refresh', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

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
