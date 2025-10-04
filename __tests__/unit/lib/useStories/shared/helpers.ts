/**
 * Shared helpers for useStories tests
 */

export function setupModuleAndMocks() {
  // Reset modules to ensure clean state
  jest.resetModules();

  // Get mocked detectUserId
  const useChaptersModule = require('@/lib/useChapters');
  const mockDetectUserId = useChaptersModule.detectUserId as jest.Mock;
  mockDetectUserId.mockResolvedValue('user-123');

  // Setup fetch mock
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  // Import module after mocking
  const useStoriesModule = require('@/lib/useStories');

  return {
    useStoriesModule,
    mockDetectUserId,
    mockFetch,
  };
}

export function restoreMocks(originalFetch: typeof global.fetch) {
  global.fetch = originalFetch;
  jest.clearAllMocks();
}
