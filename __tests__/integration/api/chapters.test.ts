/**
 * Integration tests for /api/chapters routes
 * 
 * Tests CRUD operations for chapters
 */

// Mock dbConnect to use our test database connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

import { GET as getChapters, POST as createChapter } from '@/app/api/stories/[id]/chapters/route';
import { GET as getChapter, PUT as updateChapter, DELETE as deleteChapter } from '@/app/api/chapters/[id]/route';
import {
  connectDB,
  disconnectDB,
  clearDB,
  createMockRequest,
  MOCK_USERS,
  createTestStory,
  createTestChapter,
  createStoryWithChapters,
} from '../helpers';

describe('/api/chapters - Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  describe('GET /api/stories/[id]/chapters', () => {
    it('should return empty array for story with no chapters', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await getChapters(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return chapters for a story', async () => {
      // Arrange
      const { story } = await createStoryWithChapters(MOCK_USERS.BOB, 3);
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await getChapters(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      expect(data[0].title).toBe('Chapter 1');
      expect(data[1].title).toBe('Chapter 2');
      expect(data[2].title).toBe('Chapter 3');
    });

    it('should return chapters sorted by order', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.CHARLIE);
      await createTestChapter(story._id.toString(), { title: 'Third', order: 2 });
      await createTestChapter(story._id.toString(), { title: 'First', order: 0 });
      await createTestChapter(story._id.toString(), { title: 'Second', order: 1 });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await getChapters(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data[0].title).toBe('First');
      expect(data[1].title).toBe('Second');
      expect(data[2].title).toBe('Third');
    });

    it('should return 400 for invalid story id', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/stories/invalid-id/chapters');
      const params = Promise.resolve({ id: 'invalid-id' });

      // Act
      const response = await getChapters(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid story id');
    });
  });

  describe('POST /api/stories/[id]/chapters', () => {
    it('should create chapter with authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`, {
        method: 'POST',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({
          title: 'New Chapter',
          content: 'Chapter content',
          order: 0,
          published: false,
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await createChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.title).toBe('New Chapter');
      expect(data.content).toBe('Chapter content');
      expect(data.storyId.toString()).toBe(story._id.toString());

      // Verify story chapterCount was incremented
      const Story = (await import('@/models/Story')).default;
      const updatedStory = await Story.findById(story._id);
      expect(updatedStory?.chapterCount).toBe(1);
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`, {
        method: 'POST',
        body: JSON.stringify({ title: 'Unauthorized Chapter' }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await createChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 when creating chapter for another user\'s story', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`, {
        method: 'POST',
        userId: MOCK_USERS.BOB, // Bob trying to add chapter to Alice's story
        body: JSON.stringify({ title: 'Unauthorized Chapter' }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await createChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should return 404 for non-existent story', async () => {
      // Arrange
      const fakeId = '507f1f77bcf86cd799439011';
      const req = createMockRequest(`http://localhost:3000/api/stories/${fakeId}/chapters`, {
        method: 'POST',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({ title: 'Chapter' }),
      });
      const params = Promise.resolve({ id: fakeId });

      // Act
      const response = await createChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Story not found');
    });

    it('should create chapter with minimal data', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.CHARLIE);
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/chapters`, {
        method: 'POST',
        userId: MOCK_USERS.CHARLIE,
        body: JSON.stringify({ content: 'Some content' }), // Only content provided
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await createChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.title).toBe('Untitled');
      expect(data.content).toBe('Some content');
      expect(data.published).toBe(false);
    });
  });

  describe('GET /api/chapters/[id]', () => {
    it('should return chapter by id', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString(), {
        title: 'Test Chapter',
        content: 'Test Content',
      });

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`);
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await getChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('Test Chapter');
      expect(data.content).toBe('Test Content');
    });

    it('should return 404 for non-existent chapter', async () => {
      // Arrange
      const fakeId = '507f1f77bcf86cd799439011';
      const req = createMockRequest(`http://localhost:3000/api/chapters/${fakeId}`);
      const params = Promise.resolve({ id: fakeId });

      // Act
      const response = await getChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not found');
    });

    it('should return 400 for invalid chapter id', async () => {
      // Arrange
      const req = createMockRequest('http://localhost:3000/api/chapters/invalid-id');
      const params = Promise.resolve({ id: 'invalid-id' });

      // Act
      const response = await getChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid id');
    });
  });

  describe('PUT /api/chapters/[id]', () => {
    it('should update chapter with authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString(), {
        title: 'Original Title',
        content: 'Original Content',
      });

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({
          title: 'Updated Title',
          content: 'Updated Content',
        }),
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await updateChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Title');
      expect(data.content).toBe('Updated Content');
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString());

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: 'Unauthorized Update' }),
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await updateChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 when updating chapter from another user\'s story', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString());

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.BOB, // Bob trying to edit chapter from Alice's story
        body: JSON.stringify({ title: 'Unauthorized Update' }),
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await updateChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');
    });

    it('should update only provided fields', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.CHARLIE);
      const chapter = await createTestChapter(story._id.toString(), {
        title: 'Original',
        content: 'Content',
        order: 0,
        published: false,
      });

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.CHARLIE,
        body: JSON.stringify({ title: 'Only Title Updated' }),
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await updateChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.title).toBe('Only Title Updated');
      expect(data.content).toBe('Content'); // Unchanged
    });

    it('should update chapter order', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.BOB);
      const chapter = await createTestChapter(story._id.toString(), { order: 0 });

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({ order: 5 }),
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await updateChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.order).toBe(5);
    });

    it('should update chapter published status', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString(), { published: false });

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'PUT',
        userId: MOCK_USERS.ALICE,
        body: JSON.stringify({ published: true }),
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await updateChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.published).toBe(true);
    });
  });

  describe('DELETE /api/chapters/[id]', () => {
    it('should delete chapter with authentication', async () => {
      // Arrange
      const { story } = await createStoryWithChapters(MOCK_USERS.ALICE, 3);

      // Update story chapterCount to match actual chapters
      const Story = (await import('@/models/Story')).default;
      await Story.findByIdAndUpdate(story._id, { chapterCount: 3 });

      const Chapter = (await import('@/models/Chapter')).default;
      const chapters = await Chapter.find({ storyId: story._id });
      const chapterToDelete = chapters[0];

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapterToDelete._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.ALICE,
      });
      const params = Promise.resolve({ id: chapterToDelete._id.toString() });

      // Act
      const response = await deleteChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.ok).toBe(true);

      // Verify chapter was deleted
      const deletedChapter = await Chapter.findById(chapterToDelete._id);
      expect(deletedChapter).toBeNull();

      // Verify story chapterCount was decremented
      const updatedStory = await Story.findById(story._id);
      expect(updatedStory?.chapterCount).toBe(2); // Was 3, now 2
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString());

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await deleteChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 when deleting chapter from another user\'s story', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE);
      const chapter = await createTestChapter(story._id.toString());

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.BOB, // Bob trying to delete chapter from Alice's story
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await deleteChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe('Forbidden');

      // Verify chapter was NOT deleted
      const Chapter = (await import('@/models/Chapter')).default;
      const stillExists = await Chapter.findById(chapter._id);
      expect(stillExists).not.toBeNull();
    });

    it('should return 404 for non-existent chapter', async () => {
      // Arrange
      const fakeId = '507f1f77bcf86cd799439011';
      const req = createMockRequest(`http://localhost:3000/api/chapters/${fakeId}`, {
        method: 'DELETE',
        userId: MOCK_USERS.ALICE,
      });
      const params = Promise.resolve({ id: fakeId });

      // Act
      const response = await deleteChapter(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not found');
    });

    it('should handle deletion when story chapterCount is already 0', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.CHARLIE);
      story.chapterCount = 0;
      await story.save();
      const chapter = await createTestChapter(story._id.toString());

      const req = createMockRequest(`http://localhost:3000/api/chapters/${chapter._id}`, {
        method: 'DELETE',
        userId: MOCK_USERS.CHARLIE,
      });
      const params = Promise.resolve({ id: chapter._id.toString() });

      // Act
      const response = await deleteChapter(req, { params });

      // Assert
      expect(response.status).toBe(200);

      // Verify chapterCount doesn't go negative
      const Story = (await import('@/models/Story')).default;
      const updatedStory = await Story.findById(story._id);
      expect(updatedStory?.chapterCount).toBe(0);
    });
  });
});
