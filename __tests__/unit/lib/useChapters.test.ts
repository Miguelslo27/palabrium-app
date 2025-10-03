/**
 * Tests for useChapters module
 * 
 * This module provides utility functions for managing chapters including
 * CRUD operations and publish/unpublish functionality.
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

describe('useChapters', () => {
  let useChaptersModule: any;
  let mockGetClerkClient: jest.Mock;
  let mockClerk: any;
  let mockFetch: jest.Mock;

  // Store original env and fetch
  const originalEnv = process.env.NEXT_PUBLIC_BASE_URL;
  const originalFetch = global.fetch;
  const originalWindow = global.window;

  beforeEach(() => {
    // Reset modules
    jest.resetModules();

    // Setup Clerk mock
    mockClerk = {
      load: jest.fn().mockResolvedValue(undefined),
      user: { id: 'user-123' },
    };

    mockGetClerkClient = jest.fn().mockReturnValue(mockClerk);
    jest.doMock('@/lib/clerk-client', () => ({
      __esModule: true,
      default: mockGetClerkClient,
    }));

    // Setup fetch mock
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    // Import module after mocking
    useChaptersModule = require('@/lib/useChapters');
  });

  afterEach(() => {
    // Restore original values
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_BASE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_BASE_URL;
    }
    global.fetch = originalFetch;
    global.window = originalWindow;

    jest.clearAllMocks();
  });

  describe('detectUserId', () => {
    it('should return user ID from clerk.user.id', async () => {
      // Arrange
      mockClerk.user = { id: 'clerk-user-123' };

      // Act
      const userId = await useChaptersModule.detectUserId();

      // Assert
      expect(userId).toBe('clerk-user-123');
      expect(mockClerk.load).toHaveBeenCalledTimes(1);
    });

    it('should return user ID from clerk.client.user.id if clerk.user is not available', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockClerk.client = { user: { id: 'client-user-456' } };

      // Act
      const userId = await useChaptersModule.detectUserId();

      // Assert
      expect(userId).toBe('client-user-456');
    });

    it('should return null if no user ID is found', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockClerk.client = undefined;

      // Act
      const userId = await useChaptersModule.detectUserId();

      // Assert
      expect(userId).toBeNull();
    });

    it('should handle Clerk error and fallback to window.__USER_ID__', async () => {
      // Arrange - Make clerk.load throw error
      mockClerk.load.mockRejectedValueOnce(new Error('Load failed'));
      (global.window as any).__USER_ID__ = 'fallback-user-123';

      // Act
      const userId = await useChaptersModule.detectUserId();

      // Assert
      expect(userId).toBe('fallback-user-123');

      // Cleanup
      delete (global.window as any).__USER_ID__;
    });

    it('should return null if Clerk throws error and window.__USER_ID__ is not set', async () => {
      // Arrange
      mockGetClerkClient.mockImplementation(() => {
        throw new Error('Clerk not available');
      });
      (global as any).window = {};

      // Act
      const userId = await useChaptersModule.detectUserId();

      // Assert
      expect(userId).toBeNull();
    });

    it('should return null if Clerk throws error and window is undefined', async () => {
      // Arrange
      mockGetClerkClient.mockImplementation(() => {
        throw new Error('Clerk not available');
      });
      delete (global as any).window;

      // Act
      const userId = await useChaptersModule.detectUserId();

      // Assert
      expect(userId).toBeNull();
    });

    it('should call clerk.load before accessing user', async () => {
      // Arrange
      mockClerk.user = { id: 'test-user' };

      // Act
      await useChaptersModule.detectUserId();

      // Assert
      expect(mockClerk.load).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchChapters', () => {
    it('should fetch chapters for a given story ID', async () => {
      // Arrange
      const storyId = 'story-123';
      const mockChapters = [
        { id: '1', title: 'Chapter 1', content: 'Content 1' },
        { id: '2', title: 'Chapter 2', content: 'Content 2' },
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockChapters),
      });

      // Act
      const chapters = await useChaptersModule.fetchChapters(storyId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-123/chapters');
      expect(chapters).toEqual(mockChapters);
    });

    it('should use NEXT_PUBLIC_BASE_URL if provided', async () => {
      // Arrange
      process.env.NEXT_PUBLIC_BASE_URL = 'https://example.com';
      const storyId = 'story-456';
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      // Act
      await useChaptersModule.fetchChapters(storyId);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/stories/story-456/chapters');
    });

    it('should throw error if fetch fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(useChaptersModule.fetchChapters('story-123')).rejects.toThrow('Failed to fetch chapters');
    });

    it('should handle empty chapters array', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      });

      // Act
      const chapters = await useChaptersModule.fetchChapters('story-empty');

      // Assert
      expect(chapters).toEqual([]);
    });
  });

  describe('createChapter', () => {
    const mockChapterData = {
      title: 'New Chapter',
      content: 'Chapter content',
      order: 1,
      published: false,
    };

    it('should create a chapter with user ID header', async () => {
      // Arrange
      mockClerk.user = { id: 'user-123' };
      const mockResponse = { id: 'chapter-new', ...mockChapterData };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      // Act
      const result = await useChaptersModule.createChapter('story-123', mockChapterData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-123/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-123',
        },
        body: JSON.stringify(mockChapterData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should create chapter without user ID header if not available', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockClerk.client = undefined;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await useChaptersModule.createChapter('story-123', mockChapterData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-123/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockChapterData),
      });
    });

    it('should throw error if creation fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(
        useChaptersModule.createChapter('story-123', mockChapterData)
      ).rejects.toThrow('Failed to create chapter');
    });

    it('should handle minimal chapter data', async () => {
      // Arrange
      const minimalData = { title: 'Title', content: 'Content' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(minimalData),
      });

      // Act
      await useChaptersModule.createChapter('story-123', minimalData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(minimalData),
        })
      );
    });
  });

  describe('updateChapter', () => {
    const mockUpdateData = {
      title: 'Updated Chapter',
      content: 'Updated content',
      published: true,
    };

    it('should update chapter with user ID header', async () => {
      // Arrange
      mockClerk.user = { id: 'user-456' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockUpdateData),
      });

      // Act
      const result = await useChaptersModule.updateChapter('chapter-123', mockUpdateData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-456',
        },
        body: JSON.stringify(mockUpdateData),
      });
      expect(result).toEqual(mockUpdateData);
    });

    it('should update chapter without user ID header if not available', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await useChaptersModule.updateChapter('chapter-123', mockUpdateData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockUpdateData),
      });
    });

    it('should throw error if update fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(
        useChaptersModule.updateChapter('chapter-123', mockUpdateData)
      ).rejects.toThrow('Failed to update chapter');
    });

    it('should handle partial updates', async () => {
      // Arrange
      const partialData = { title: 'Only Title Updated' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(partialData),
      });

      // Act
      await useChaptersModule.updateChapter('chapter-123', partialData as any);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(partialData),
        })
      );
    });
  });

  describe('deleteChapter', () => {
    it('should delete chapter with user ID header', async () => {
      // Arrange
      mockClerk.user = { id: 'user-789' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      const result = await useChaptersModule.deleteChapter('chapter-456');

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-456', {
        method: 'DELETE',
        headers: {
          'x-user-id': 'user-789',
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should delete chapter without user ID header if not available', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await useChaptersModule.deleteChapter('chapter-456');

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-456', {
        method: 'DELETE',
        headers: {},
      });
    });

    it('should throw error if deletion fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(
        useChaptersModule.deleteChapter('chapter-456')
      ).rejects.toThrow('Failed to delete chapter');
    });

    it('should handle network errors', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(
        useChaptersModule.deleteChapter('chapter-456')
      ).rejects.toThrow('Network error');
    });
  });

  describe('toggleChapterPublish', () => {
    it('should publish chapter with user ID header', async () => {
      // Arrange
      mockClerk.user = { id: 'user-publish' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ published: true }),
      });

      // Act
      const result = await useChaptersModule.toggleChapterPublish('chapter-789', true);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-789/publish', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-publish',
        },
        body: JSON.stringify({ published: true }),
      });
      expect(result).toEqual({ published: true });
    });

    it('should unpublish chapter', async () => {
      // Arrange
      mockClerk.user = { id: 'user-unpublish' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ published: false }),
      });

      // Act
      const result = await useChaptersModule.toggleChapterPublish('chapter-789', false);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-789/publish', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-unpublish',
        },
        body: JSON.stringify({ published: false }),
      });
      expect(result).toEqual({ published: false });
    });

    it('should toggle publish without user ID header if not available', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await useChaptersModule.toggleChapterPublish('chapter-789', true);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-789/publish', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: true }),
      });
    });

    it('should throw error if toggle fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(
        useChaptersModule.toggleChapterPublish('chapter-789', true)
      ).rejects.toThrow('Failed to toggle publish chapter');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete chapter lifecycle', async () => {
      // Arrange
      mockClerk.user = { id: 'integration-user' };
      const storyId = 'story-integration';
      const chapterData = { title: 'Test', content: 'Test content' };

      // Mock all fetch calls
      mockFetch
        .mockResolvedValueOnce({ // create
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'new-chapter', ...chapterData }),
        })
        .mockResolvedValueOnce({ // update
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'new-chapter', title: 'Updated' }),
        })
        .mockResolvedValueOnce({ // publish
          ok: true,
          json: jest.fn().mockResolvedValue({ published: true }),
        })
        .mockResolvedValueOnce({ // delete
          ok: true,
          json: jest.fn().mockResolvedValue({ success: true }),
        });

      // Act
      const created = await useChaptersModule.createChapter(storyId, chapterData);
      const updated = await useChaptersModule.updateChapter(created.id, { title: 'Updated' });
      const published = await useChaptersModule.toggleChapterPublish(created.id, true);
      const deleted = await useChaptersModule.deleteChapter(created.id);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(created.id).toBe('new-chapter');
      expect(updated.title).toBe('Updated');
      expect(published.published).toBe(true);
      expect(deleted.success).toBe(true);
    });

    it('should handle user authentication changes', async () => {
      // Arrange - Start with authenticated user
      mockClerk.user = { id: 'auth-user' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act - Create chapter while authenticated
      await useChaptersModule.createChapter('story-1', { title: 'A', content: 'B' });

      // Arrange - User logs out
      mockClerk.user = undefined;
      mockClerk.client = undefined;

      // Act - Try to create chapter while not authenticated
      await useChaptersModule.createChapter('story-1', { title: 'C', content: 'D' });

      // Assert
      const firstCall = mockFetch.mock.calls[0][1];
      const secondCall = mockFetch.mock.calls[1][1];

      expect(firstCall.headers['x-user-id']).toBe('auth-user');
      expect(secondCall.headers['x-user-id']).toBeUndefined();
    });

    it('should handle concurrent operations', async () => {
      // Arrange
      mockClerk.user = { id: 'concurrent-user' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act - Multiple concurrent operations
      await Promise.all([
        useChaptersModule.createChapter('story-1', { title: '1', content: '1' }),
        useChaptersModule.updateChapter('chapter-1', { title: '2', content: '2' }),
        useChaptersModule.deleteChapter('chapter-2'),
      ]);

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('error scenarios', () => {
    it('should handle fetch network errors', async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error('Network failed'));

      // Act & Assert
      await expect(useChaptersModule.fetchChapters('story-1')).rejects.toThrow('Network failed');
    });

    it('should handle malformed JSON response', async () => {
      // Arrange
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      // Act & Assert
      await expect(useChaptersModule.fetchChapters('story-1')).rejects.toThrow('Invalid JSON');
    });

    it('should handle detectUserId error in create operation', async () => {
      // Arrange
      mockGetClerkClient.mockImplementation(() => {
        throw new Error('Clerk error');
      });
      delete (global as any).window;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act - Should still work without user ID
      await useChaptersModule.createChapter('story-1', { title: 'Test', content: 'Test' });

      // Assert - Should proceed without x-user-id header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({ 'x-user-id': expect.any(String) }),
        })
      );
    });
  });
});
