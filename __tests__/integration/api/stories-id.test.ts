/**
 * Integration tests for /api/stories/[id] route
 * 
 * Tests GET (get story), PUT (update story), and DELETE (delete story) endpoints
 */

// Mock dbConnect to use our test database connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

import { GET, PUT, DELETE } from '@/app/api/stories/[id]/route';
import {
  connectDB,
  disconnectDB,
  clearDB,
  createMockRequest,
  MOCK_USERS,
  createTestStory,
  createStoryWithChapters,
} from '../helpers';

describe('/api/stories/[id] - Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('GET /api/stories/[id]', () => {
    it('should return a story by id', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, {
        title: 'My Story',
        description: 'Story description',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('My Story');
      expect(data.description).toBe('Story description');
      expect(data.authorId).toBe(MOCK_USERS.ALICE);
      expect(data.chapters).toEqual([]);
    });

    it('should return story with chapters', async () => {
      // Arrange
      const { story } = await createStoryWithChapters(MOCK_USERS.BOB, 3);

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.chapters).toHaveLength(3);
      expect(data.chapters[0].title).toBe('Chapter 1');
      expect(data.chapters[1].title).toBe('Chapter 2');
      expect(data.chapters[2].title).toBe('Chapter 3');
    });

    it('should return 404 for non-existent story', async () => {
      // Arrange
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const req = createMockRequest(`http://localhost:3000/api/stories/${fakeId}`);
      const params = Promise.resolve({ id: fakeId });

      // Act
      const response = await GET(req, { params });

      // Assert
      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe('Not found');
    });

    it('should return chapters sorted by order', async () => {
      // Arrange
      const { story } = await createStoryWithChapters(MOCK_USERS.CHARLIE, 3);

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.chapters[0].order).toBe(0);
      expect(data.chapters[1].order).toBe(1);
      expect(data.chapters[2].order).toBe(2);
    });
  });

  describe('PUT /api/stories/[id]', () => {
    it('should update story with authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, {
        title: 'Original Title',
        description: 'Original Description',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({
          title: 'Updated Title',
          description: 'Updated Description',
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await PUT(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Title');
      expect(data.description).toBe('Updated Description');
      expect(data.authorId).toBe(MOCK_USERS.ALICE);
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Unauthorized Update' }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await PUT(req, { params });

      // Assert
      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toBe('Unauthorized');
    });

    it('should return 403 when updating another user\'s story', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, {
        title: 'Alice\'s Story',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.BOB, // Bob trying to edit Alice's story
        body: JSON.stringify({ title: 'Bob\'s Unauthorized Edit' }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await PUT(req, { params });

      // Assert
      expect(response.status).toBe(403);
      const text = await response.text();
      expect(text).toBe('Forbidden');
    });

    it('should return 404 for non-existent story', async () => {
      // Arrange
      const fakeId = '507f1f77bcf86cd799439011';
      const req = createMockRequest(`http://localhost:3000/api/stories/${fakeId}`, {
        method: 'PUT',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({ title: 'Update Non-existent' }),
      });
      const params = Promise.resolve({ id: fakeId });

      // Act
      const response = await PUT(req, { params });

      // Assert
      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe('Story not found');
    });

    it('should update only provided fields', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.CHARLIE, {
        title: 'Original Title',
        description: 'Original Description',
        published: false,
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.CHARLIE,
        body: JSON.stringify({
          title: 'Only Title Updated',
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await PUT(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('Only Title Updated');
      expect(data.description).toBe('Original Description'); // Unchanged
      expect(data.published).toBe(false); // Unchanged
    });

    it('should update published status', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, {
        title: 'Draft Story',
        published: false,
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({
          published: true,
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await PUT(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.published).toBe(true);
    });

    it('should handle empty update body', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.BOB, {
        title: 'Original',
        description: 'Description',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await PUT(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('Original'); // Unchanged
      expect(data.description).toBe('Description'); // Unchanged
    });
  });

  describe('DELETE /api/stories/[id]', () => {
    it('should delete story with authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, {
        title: 'Story to Delete',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.ALICE,
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await DELETE(req, { params });

      // Assert
      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe('Story deleted');

      // Verify story was deleted
      const Story = (await import('@/models/Story')).default;
      const deletedStory = await Story.findById(story._id);
      expect(deletedStory).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await DELETE(req, { params });

      // Assert
      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toBe('Unauthorized');
    });

    it('should return 403 when deleting another user\'s story', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, {
        title: 'Alice\'s Story',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.BOB, // Bob trying to delete Alice's story
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await DELETE(req, { params });

      // Assert
      expect(response.status).toBe(403);
      const text = await response.text();
      expect(text).toBe('Forbidden');

      // Verify story was NOT deleted
      const Story = (await import('@/models/Story')).default;
      const stillExists = await Story.findById(story._id);
      expect(stillExists).not.toBeNull();
    });

    it('should return 404 for non-existent story', async () => {
      // Arrange
      const fakeId = '507f1f77bcf86cd799439011';
      const req = createMockRequest(`http://localhost:3000/api/stories/${fakeId}`, {
        method: 'DELETE',
        userId: MOCK_USERS.ALICE,
      });
      const params = Promise.resolve({ id: fakeId });

      // Act
      const response = await DELETE(req, { params });

      // Assert
      expect(response.status).toBe(404);
      const text = await response.text();
      expect(text).toBe('Story not found');
    });

    it('should delete associated chapters when deleting story', async () => {
      // Arrange
      const { story } = await createStoryWithChapters(MOCK_USERS.CHARLIE, 3);

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.CHARLIE,
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await DELETE(req, { params });

      // Assert
      expect(response.status).toBe(200);

      // Verify chapters were also deleted
      const Chapter = (await import('@/models/Chapter')).default;
      const remainingChapters = await Chapter.find({ storyId: story._id });
      expect(remainingChapters).toHaveLength(0);
    });

    it('should handle deletion of story with no chapters', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.BOB, {
        title: 'Story with no chapters',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.BOB,
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await DELETE(req, { params });

      // Assert
      expect(response.status).toBe(200);

      const Story = (await import('@/models/Story')).default;
      const deletedStory = await Story.findById(story._id);
      expect(deletedStory).toBeNull();
    });
  });
});
