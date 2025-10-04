/**
 * Tests for useChapters - fetchChapters
 * 
 * Tests for fetching chapters for a story
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useChapters - fetchChapters', () => {
  let useChaptersModule: any;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    const setup = setupModuleAndMocks();
    useChaptersModule = setup.useChaptersModule;
    mockFetch = setup.mockFetch;
  });

  afterEach(() => {
    restoreMocks();
  });

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
