/**
 * Tests for useStories - Error Scenarios
 * 
 * Tests for error handling in story operations
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useStories - Error Scenarios', () => {
  let useStoriesModule: any;
  let mockDetectUserId: jest.Mock;
  let mockFetch: jest.Mock;
  const originalFetch = global.fetch;

  beforeEach(() => {
    const setup = setupModuleAndMocks();
    useStoriesModule = setup.useStoriesModule;
    mockDetectUserId = setup.mockDetectUserId;
    mockFetch = setup.mockFetch;
  });

  afterEach(() => {
    restoreMocks(originalFetch);
  });

  it('should handle network errors', async () => {
    // Arrange
    mockFetch.mockRejectedValue(new Error('Network error'));

    // Act & Assert
    await expect(
      useStoriesModule.toggleStoryPublish('story-network-error', true)
    ).rejects.toThrow('Network error');
  });

  it('should handle malformed JSON response', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    });

    // Act & Assert
    await expect(
      useStoriesModule.toggleStoryPublish('story-bad-json', true)
    ).rejects.toThrow('Invalid JSON');
  });

  it('should handle detectUserId errors gracefully', async () => {
    // Arrange
    mockDetectUserId.mockRejectedValue(new Error('Auth service down'));
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act & Assert - Should propagate the error
    await expect(
      useStoriesModule.toggleStoryPublish('story-auth-error', true)
    ).rejects.toThrow('Auth service down');
  });

  it('should handle HTTP error responses', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    });

    // Act & Assert
    await expect(
      useStoriesModule.toggleStoryPublish('story-forbidden', true)
    ).rejects.toThrow('Failed to toggle publish story');
  });

  it('should handle server errors (500)', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    // Act & Assert
    await expect(
      useStoriesModule.toggleStoryPublish('story-server-error', true)
    ).rejects.toThrow('Failed to toggle publish story');
  });
});
