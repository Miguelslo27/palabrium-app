/**
 * Shared test helpers for useChapters tests
 */

// Store original values
export const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;
export const originalFetch = global.fetch;
export const originalWindow = global.window;

/**
 * Setup mocks and return the module and mocks
 */
export const setupModuleAndMocks = () => {
  // Reset modules
  jest.resetModules();

  // Setup Clerk mock
  const mockClerk = {
    load: jest.fn().mockResolvedValue(undefined),
    user: { id: 'user-123' },
  };

  const mockGetClerkClient = jest.fn().mockReturnValue(mockClerk);
  jest.doMock('@/lib/clerk-client', () => ({
    __esModule: true,
    default: mockGetClerkClient,
  }));

  // Setup fetch mock
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Import module after mocking
  const useChaptersModule = require('@/lib/useChapters');

  return { useChaptersModule, mockClerk, mockGetClerkClient, mockFetch };
};

/**
 * Restore mocks after each test
 */
export const restoreMocks = () => {
  // Restore original values
  if (originalEnv !== undefined) {
    process.env.NEXT_PUBLIC_BASE_URL = originalEnv;
  } else {
    delete process.env.NEXT_PUBLIC_BASE_URL;
  }
  global.fetch = originalFetch;
  global.window = originalWindow;

  jest.clearAllMocks();
};

/**
 * Mock a successful fetch response
 */
export const mockSuccessfulFetch = (data: any) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => data,
  });
};

/**
 * Mock a failed fetch response
 */
export const mockFailedFetch = (status: number = 500) => {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: false,
    status,
  });
};

/**
 * Mock a network error
 */
export const mockNetworkError = () => {
  (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
};
