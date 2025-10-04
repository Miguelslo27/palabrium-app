/**
 * Integration tests for /api/stories route
 * 
 * Tests GET (list stories) and POST (create story) endpoints
 */

// Mock dbConnect to use our test database connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

import { GET, POST } from '@/app/api/stories/route';
import {
  connectDB,
  disconnectDB,
  clearDB,
  createMockRequest,
  MOCK_USERS,
  createTestStory,
  createMultipleStories
} from '../helpers';

describe('/api/stories - Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('GET /api/stories', () => {
    it('should return empty list when no stories exist', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        items: [],
        total: 0,
        skip: 0,
        limit: 50,
      });
    });

    it('should return only published stories', async () => {
      // Arrange
      await createTestStory(MOCK_USERS.ALICE, { title: 'Published Story', published: true });
      await createTestStory(MOCK_USERS.ALICE, { title: 'Draft Story', published: false });

      const req = createMockRequest('http://localhost:3000/api/stories');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.total).toBe(1);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].title).toBe('Published Story');
      expect(data.items[0].published).toBe(true);
    });

    it('should support pagination with skip and limit', async () => {
      // Arrange
      await createMultipleStories(MOCK_USERS.ALICE, 5);
      // Publish all stories
      const Story = (await import('@/models/Story')).default;
      await Story.updateMany({}, { published: true });

      const req = createMockRequest('http://localhost:3000/api/stories?skip=2&limit=2');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.total).toBe(5);
      expect(data.skip).toBe(2);
      expect(data.limit).toBe(2);
      expect(data.items).toHaveLength(2);
    });

    it('should enforce maximum limit of 50', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories?limit=100');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.limit).toBe(50);
    });

    it('should handle invalid skip/limit parameters', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories?skip=-5&limit=invalid');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.skip).toBe(0); // Defaults to 0 for negative
      expect(data.limit).toBe(50); // Defaults to 50 for invalid
    });

    it('should search stories by title', async () => {
      // Arrange
      await createTestStory(MOCK_USERS.ALICE, {
        title: 'Fantasy Adventure',
        published: true
      });
      await createTestStory(MOCK_USERS.BOB, {
        title: 'Science Fiction Story',
        published: true
      });

      const req = createMockRequest('http://localhost:3000/api/stories?q=Fantasy');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.total).toBe(1);
      expect(data.items[0].title).toBe('Fantasy Adventure');
    });

    it('should search stories by description', async () => {
      // Arrange
      await createTestStory(MOCK_USERS.ALICE, {
        title: 'Test Story',
        description: 'An epic adventure in space',
        published: true
      });
      await createTestStory(MOCK_USERS.BOB, {
        title: 'Another Story',
        description: 'A mystery on Earth',
        published: true
      });

      const req = createMockRequest('http://localhost:3000/api/stories?q=space');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.total).toBe(1);
      expect(data.items[0].description).toContain('space');
    });

    it('should return stories sorted by createdAt descending', async () => {
      // Arrange
      const story1 = await createTestStory(MOCK_USERS.ALICE, {
        title: 'First Story',
        published: true
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const story2 = await createTestStory(MOCK_USERS.ALICE, {
        title: 'Second Story',
        published: true
      });

      const req = createMockRequest('http://localhost:3000/api/stories');

      // Act
      const response = await GET(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(2);
      // Most recent story should be first
      expect(data.items[0].title).toBe('Second Story');
      expect(data.items[1].title).toBe('First Story');
    });
  });

  describe('POST /api/stories', () => {
    it('should create a story with authentication', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({
          title: 'New Story',
          description: 'A new adventure',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe('Story created');
      expect(data.id).toBeDefined();

      // Verify story was created in DB
      const Story = (await import('@/models/Story')).default;
      const story = await Story.findById(data.id);
      expect(story).not.toBeNull();
      expect(story?.title).toBe('New Story');
      expect(story?.authorId).toBe(MOCK_USERS.ALICE);
      expect(story?.published).toBe(false); // Default
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Unauthorized Story',
          description: 'Should not be created',
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toBe('Unauthorized');
    });

    it('should create published story when published is true', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({
          title: 'Published Story',
          description: 'Already published',
          published: true,
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);

      const Story = (await import('@/models/Story')).default;
      const story = await Story.findById(data.id);
      expect(story?.published).toBe(true);
    });

    it('should create story with initial chapters', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        userId: MOCK_USERS.CHARLIE,
        body: JSON.stringify({
          title: 'Story with Chapters',
          description: 'Has initial chapters',
          chapters: [
            { title: 'Chapter 1', content: 'First chapter content', order: 0 },
            { title: 'Chapter 2', content: 'Second chapter content', order: 1 },
          ],
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);

      // Verify chapters were created
      const Chapter = (await import('@/models/Chapter')).default;
      const chapters = await Chapter.find({ storyId: data.id }).sort({ order: 1 });
      expect(chapters).toHaveLength(2);
      expect(chapters[0].title).toBe('Chapter 1');
      expect(chapters[1].title).toBe('Chapter 2');

      // Verify story chapterCount was updated
      const Story = (await import('@/models/Story')).default;
      const story = await Story.findById(data.id);
      expect(story?.chapterCount).toBe(2);
    });

    it('should handle missing title gracefully', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({
          description: 'Story without title',
        }),
      });

      // Act
      const response = await POST(req);

      // Assert
      // Should return 500 or validation error because title is required in model
      expect(response.status).toBe(500);
    });

    it('should create story with minimal data', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories', {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({
          title: 'Minimal Story',
          description: '',
        }),
      });

      // Act
      const response = await POST(req);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);

      const Story = (await import('@/models/Story')).default;
      const story = await Story.findById(data.id);
      expect(story?.title).toBe('Minimal Story');
      expect(story?.description).toBe('');
    });
  });
});
