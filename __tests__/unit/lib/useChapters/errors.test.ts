/**
 * Tests for useChapters - Error Scenarios
 * 
 * Tests for error handling and edge cases
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useChapters - Error Scenarios', () => {
  let useChaptersModule: any;
  let mockFetch: jest.Mock;
  let mockGetClerkClient: jest.Mock;

  beforeEach(() => {
    const setup = setupModuleAndMocks();
    useChaptersModule = setup.useChaptersModule;
    mockFetch = setup.mockFetch;
    mockGetClerkClient = setup.mockGetClerkClient;
  });

  afterEach(() => {
    restoreMocks();
  });

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
