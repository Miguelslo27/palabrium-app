/**
 * Tests for useStories module
 * 
 * This module provides utility functions for managing stories,
 * specifically for publishing and unpublishing stories.
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

describe('useStories', () => {
  let useStoriesModule: any;
  let mockDetectUserId: jest.Mock;
  let mockFetch: jest.Mock;

  // Store original fetch
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Reset modules
    jest.resetModules();

    // Get mocked detectUserId
    const useChaptersModule = require('@/lib/useChapters');
    mockDetectUserId = useChaptersModule.detectUserId as jest.Mock;
    mockDetectUserId.mockResolvedValue('user-123');

    // Setup fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Import module after mocking
    useStoriesModule = require('@/lib/useStories');
  });

  afterEach(() => {
    // Restore original fetch
    global.fetch = originalFetch;

    jest.clearAllMocks();
  });

  describe('toggleStoryPublish', () => {
    describe('publishing stories', () => {
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

    describe('unpublishing stories', () => {
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

    describe('user ID handling', () => {
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

    describe('error scenarios', () => {
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

    describe('integration scenarios', () => {
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

    describe('response data handling', () => {
      it('should return full response data', async () => {
        // Arrange
        const mockResponseData = {
          id: 'story-123',
          title: 'My Story',
          published: true,
          publishedAt: '2025-10-03T00:00:00Z',
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue(mockResponseData),
        });

        // Act
        const result = await useStoriesModule.toggleStoryPublish('story-123', true);

        // Assert
        expect(result).toEqual(mockResponseData);
      });

      it('should handle empty response', async () => {
        // Arrange
        mockFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        });

        // Act
        const result = await useStoriesModule.toggleStoryPublish('story-empty', true);

        // Assert
        expect(result).toEqual({});
      });

      it('should handle response with additional fields', async () => {
        // Arrange
        const responseWithExtras = {
          published: true,
          metadata: { views: 100, likes: 50 },
          author: { id: 'author-123', name: 'John' },
        };
        mockFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue(responseWithExtras),
        });

        // Act
        const result = await useStoriesModule.toggleStoryPublish('story-extras', true);

        // Assert
        expect(result).toEqual(responseWithExtras);
      });
    });

    describe('request validation', () => {
      it('should always send Content-Type header', async () => {
        // Arrange
        mockFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        });

        // Act
        await useStoriesModule.toggleStoryPublish('story-headers', true);

        // Assert
        const headers = mockFetch.mock.calls[0][1].headers;
        expect(headers['Content-Type']).toBe('application/json');
      });

      it('should always use PUT method', async () => {
        // Arrange
        mockFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        });

        // Act
        await useStoriesModule.toggleStoryPublish('story-method', true);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });

      it('should serialize published flag correctly', async () => {
        // Arrange
        mockFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({}),
        });

        // Act
        await useStoriesModule.toggleStoryPublish('story-serialize', true);

        // Assert
        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ published: true }),
          })
        );
      });
    });
  });
});
