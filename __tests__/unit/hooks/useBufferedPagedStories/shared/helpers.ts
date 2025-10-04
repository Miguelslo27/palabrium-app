/**
 * Shared test helpers for useBufferedPagedStories tests
 */

import type { Story } from '@/types/story';

/**
 * Setup common mocks before each test
 */
export const setupMocks = () => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  // Mock window.location.origin for URL building
  delete (window as any).location;
  (window as any).location = { origin: 'http://localhost:3000' };
};

/**
 * Mock a successful fetch response
 */
export const mockSuccessfulFetch = (items: Story[], total: number) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({
      items,
      total,
    }),
  });
};

/**
 * Mock a failed fetch response
 */
export const mockFailedFetch = (status: number = 500, statusText: string = 'Internal Server Error') => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
    statusText,
  });
};

/**
 * Mock a network error
 */
export const mockNetworkError = (message: string = 'Network error') => {
  (global.fetch as jest.Mock).mockRejectedValue(new Error(message));
};

/**
 * Mock an unauthorized response (401)
 */
export const mockUnauthorizedFetch = () => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
  });
};

/**
 * Restore all mocks
 */
export const restoreMocks = () => {
  jest.restoreAllMocks();
};
