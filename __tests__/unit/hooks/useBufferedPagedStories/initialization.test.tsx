/**
 * Tests for useBufferedPagedStories hook - Initialization
 * 
 * Tests for initial state, default values, and first batch fetch
 */

import { renderHook, waitFor } from '../../../setup/test-utils';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, mockSuccessfulFetch, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Initialization', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should initialize with default values', async () => {
    // Arrange
    mockSuccessfulFetch(createMockStories(1, 50), 100);

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
    mockSuccessfulFetch(createMockStories(1, 20), 50);

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
    mockSuccessfulFetch(mockStories, 100);

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
