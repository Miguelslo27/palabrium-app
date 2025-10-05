/**
 * Tests for useBufferedPagedStories hook - Headers Provider
 * 
 * Tests for custom header provider functionality
 */

import { renderHook, waitFor } from '../../../setup/test-utils';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';
import { setupMocks, mockSuccessfulFetch, restoreMocks } from './shared/helpers';
import { createMockStories } from './shared/fixtures';

describe('useBufferedPagedStories - Headers Provider', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should call headersProvider and include headers in request', async () => {
    // Arrange
    const mockHeadersProvider = jest.fn().mockResolvedValue({
      'x-user-id': 'user123',
      'x-custom': 'value',
    });

    mockSuccessfulFetch(createMockStories(1, 10), 10);

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

  it('should not fetch when headersProvider throws an error', async () => {
    // Arrange
    const mockHeadersProvider = jest.fn().mockRejectedValue(new Error('Auth error'));

    mockSuccessfulFetch(createMockStories(1, 10), 10);

    // Act
    renderHook(() =>
      useBufferedPagedStories({
        headersProvider: mockHeadersProvider,
      })
    );

    // Wait a bit to ensure no fetch happens
    await new Promise(resolve => setTimeout(resolve, 100));

    // Assert - fetch should NOT be called when headersProvider throws
    expect(mockHeadersProvider).toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
