/**
 * Tests for useStories - Integration Scenarios
 * 
 * Tests for complex workflows and concurrent operations
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useStories - Integration Scenarios', () => {
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

  it('should handle rapid toggle operations', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act - Toggle multiple times rapidly
    await Promise.all([
      useStoriesModule.toggleStoryPublish('story-1', true),
      useStoriesModule.toggleStoryPublish('story-1', false),
      useStoriesModule.toggleStoryPublish('story-1', true),
    ]);

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockDetectUserId).toHaveBeenCalledTimes(3);
  });

  it('should handle multiple stories being toggled concurrently', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act
    await Promise.all([
      useStoriesModule.toggleStoryPublish('story-1', true),
      useStoriesModule.toggleStoryPublish('story-2', true),
      useStoriesModule.toggleStoryPublish('story-3', false),
    ]);

    // Assert
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-1/publish', expect.any(Object));
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-2/publish', expect.any(Object));
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-3/publish', expect.any(Object));
  });

  it('should complete full publish-unpublish cycle', async () => {
    // Arrange
    const storyId = 'story-lifecycle';
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ published: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ published: false }),
      });

    // Act
    const publishResult = await useStoriesModule.toggleStoryPublish(storyId, true);
    const unpublishResult = await useStoriesModule.toggleStoryPublish(storyId, false);

    // Assert
    expect(publishResult.published).toBe(true);
    expect(unpublishResult.published).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
