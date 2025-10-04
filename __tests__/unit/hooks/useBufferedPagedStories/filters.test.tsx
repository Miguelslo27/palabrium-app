/**
 * Tests for useBufferedPagedStories hook - Filters
 * 
 * Tests for filter handling and URL parameter generation
 */

import { renderHook, waitFor } from '../../../setup/test-utils';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, mockSuccessfulFetch, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Filters', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should include filters in request URL', async () => {
    // Arrange
    mockSuccessfulFetch(createMockStories(1, 10), 10);

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
    mockSuccessfulFetch(createMockStories(1, 10), 10);

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
    mockSuccessfulFetch(createMockStories(1, 50), 100);

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
