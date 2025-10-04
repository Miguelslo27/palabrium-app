/**
 * Tests for useStories - Response Data and Request Validation
 * 
 * Tests for response handling and request validation
 */

// Mock useChapters module to control detectUserId behavior
jest.mock('@/lib/useChapters', () => ({
  detectUserId: jest.fn(),
}));

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useStories - Response Data and Request Validation', () => {
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
