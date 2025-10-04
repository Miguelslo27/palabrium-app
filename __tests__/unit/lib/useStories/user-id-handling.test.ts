/**
 * Tests for useStories - User ID Handling
 * 
 * Tests for detecting and handling user IDs
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useStories - User ID Handling', () => {
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

  it('should convert numeric user ID to string', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue(12345);
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act
    await useStoriesModule.toggleStoryPublish('story-numeric-user', true);

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-user-id': '12345',
        }),
      })
    );
  });

  it('should handle empty string user ID', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue('');
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act
    await useStoriesModule.toggleStoryPublish('story-empty-user', true);

    // Assert
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['x-user-id']).toBeUndefined();
  });

  it('should handle undefined user ID', async () => {
    // Arrange
    mockDetectUserId.mockResolvedValue(undefined);
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act
    await useStoriesModule.toggleStoryPublish('story-undefined-user', true);

    // Assert
    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers['x-user-id']).toBeUndefined();
  });

  it('should wait for detectUserId to resolve before making request', async () => {
    // Arrange
    let resolveUserId: (value: string) => void;
    const userIdPromise = new Promise<string>((resolve) => {
      resolveUserId = resolve;
    });
    mockDetectUserId.mockReturnValue(userIdPromise);
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });

    // Act
    const togglePromise = useStoriesModule.toggleStoryPublish('story-wait', true);

    // Assert - fetch should not be called yet
    expect(mockFetch).not.toHaveBeenCalled();

    // Resolve user ID
    resolveUserId!('delayed-user');
    await togglePromise;

    // Assert - fetch should now be called with user ID
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-user-id': 'delayed-user',
        }),
      })
    );
  });
});
