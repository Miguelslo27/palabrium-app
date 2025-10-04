/**
 * Tests for useStories - Publishing Stories
 * 
 * Tests for publishing story operations
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useStories - Publishing Stories', () => {
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

  it('should publish story with user ID header', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue('user-publish-123');
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ published: true }),
    });

    // Act
    const result = await useStoriesModule.toggleStoryPublish('story-456', true);

    // Assert
    expect(mockDetectUserId).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-456/publish', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-publish-123',
      },
      body: JSON.stringify({ published: true }),
    });
    expect(result).toEqual({ published: true });
  });

  it('should publish story without user ID header if not available', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ published: true }),
    });

    // Act
    const result = await useStoriesModule.toggleStoryPublish('story-789', true);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-789/publish', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ published: true }),
    });
    expect(result).toEqual({ published: true });
  });

  it('should throw error if publish fails', async () => {
    // Arrange
    mockFetch.mockResolvedValue({ ok: false });

    // Act & Assert
    await expect(
      useStoriesModule.toggleStoryPublish('story-fail', true)
    ).rejects.toThrow('Failed to toggle publish story');
  });

  it('should handle story ID with special characters', async () => {
    // Arrange
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act
    await useStoriesModule.toggleStoryPublish('story-with-dashes-123', true);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/stories/story-with-dashes-123/publish',
      expect.any(Object)
    );
  });
});
