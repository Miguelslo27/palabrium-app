/**
 * Tests for useBufferedPagedStories hook - Error Handling
 * 
 * Tests for various error scenarios and recovery
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, mockNetworkError, mockFailedFetch, mockUnauthorizedFetch, mockSuccessfulFetch, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Error Handling', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should handle fetch errors', async () => {
    // Arrange
    mockNetworkError();

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
    mockFailedFetch(500);

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
    mockUnauthorizedFetch();

    // Act
    const { result } = renderHook(() => useBufferedPagedStories());

    // Assert
    await waitFor(() => {
      expect(result.current.unauthorized).toBe(true);
    });
  });

  it('should allow retry on error', async () => {
    // Arrange - first call fails
    mockNetworkError();

    // Act
    const { result } = renderHook(() => useBufferedPagedStories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First attempt should fail - items should be empty
    expect(result.current.itemsForPage).toEqual([]);

    // Now mock successful response for retry
    mockSuccessfulFetch(createMockStories(1, 10), 10);

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
