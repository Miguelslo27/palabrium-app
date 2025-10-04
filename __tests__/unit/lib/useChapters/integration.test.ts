/**
 * Tests for useChapters - Integration Scenarios
 * 
 * Tests for complex workflows involving multiple operations
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useChapters - Integration Scenarios', () => {
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
