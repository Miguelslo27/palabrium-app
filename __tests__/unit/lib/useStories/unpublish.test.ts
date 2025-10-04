/**
 * Tests for useStories - Unpublishing Stories
 * 
 * Tests for unpublishing story operations
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useStories - Unpublishing Stories', () => {
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

  it('should unpublish story with user ID header', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue('user-unpublish-456');
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ published: false }),
    });

    // Act
    const result = await useStoriesModule.toggleStoryPublish('story-unpublish', false);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-unpublish/publish', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-unpublish-456',
      },
      body: JSON.stringify({ published: false }),
    });
    expect(result).toEqual({ published: false });
  });

  it('should unpublish story without user ID header if not available', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ published: false }),
    });

    // Act
    await useStoriesModule.toggleStoryPublish('story-no-user', false);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-no-user/publish', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ published: false }),
    });
  });

  it('should throw error if unpublish fails', async () => {
    // Arrange
    mockFetch.mockResolvedValue({ ok: false });

    // Act & Assert
    await expect(
      useStoriesModule.toggleStoryPublish('story-fail-unpublish', false)
    ).rejects.toThrow('Failed to toggle publish story');
  });
});
