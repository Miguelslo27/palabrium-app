/**
 * Tests for useChapters - Toggle Publish
 * 
 * Tests for publishing and unpublishing chapters
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useChapters - Toggle Publish', () => {
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
