/**
 * Tests for useChapters - CRUD Operations
 * 
 * Tests for create, update, and delete chapter operations
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useChapters - CRUD Operations', () => {
  let useChaptersModule: any;
  let mockClerk: any;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    const setup = setupModuleAndMocks();
    useChaptersModule = setup.useChaptersModule;
    mockClerk = setup.mockClerk;
    mockFetch = setup.mockFetch;
  });

  afterEach(() => {
    restoreMocks();
  });

  describe('createChapter', () => {
    const createData = {
      title: 'New Chapter',
      content: 'Chapter content',
      order: 1,
      published: false,
    };

    it('should create a chapter with user ID header', async () => {
      // Arrange
      mockClerk.user = { id: 'user-123' };
      const mockResponse = { id: 'chapter-new', ...createData };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      // Act
      const result = await useChaptersModule.createChapter('story-123', createData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-123/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-123',
        },
        body: JSON.stringify(createData),
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
      await useChaptersModule.createChapter('story-123', createData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/stories/story-123/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });
    });

    it('should throw error if creation fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(
        useChaptersModule.createChapter('story-123', createData)
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
    const updateData = {
      title: 'Updated Chapter',
      content: 'Updated content',
      published: true,
    };

    it('should update chapter with user ID header', async () => {
      // Arrange
      mockClerk.user = { id: 'user-456' };
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(updateData),
      });

      // Act
      const result = await useChaptersModule.updateChapter('chapter-123', updateData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'user-456',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(updateData);
    });

    it('should update chapter without user ID header if not available', async () => {
      // Arrange
      mockClerk.user = undefined;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      });

      // Act
      await useChaptersModule.updateChapter('chapter-123', updateData);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('/api/chapters/chapter-123', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
    });

    it('should throw error if update fails', async () => {
      // Arrange
      mockFetch.mockResolvedValue({ ok: false });

      // Act & Assert
      await expect(
        useChaptersModule.updateChapter('chapter-123', updateData)
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
});
