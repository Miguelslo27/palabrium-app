/**
 * Integration tests for /api/stories/[id]/comments route
 * 
 * Tests GET (list comments) and POST (create comment) endpoints
 */

// Mock dbConnect to use our test database connection
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({}),
}));

// Mock clerkClient for user enrichment
jest.mock('@/lib/clerk', () => ({
  __esModule: true,
  default: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

import { GET, POST } from '@/app/api/stories/[id]/comments/route';
import clerkClient from '@/lib/clerk';
import {
  connectDB,
  disconnectDB,
  clearDB,
  createMockRequest,
  MOCK_USERS,
  createTestStory,
  createTestComment,
} from '../helpers';

const mockGetUser = clerkClient.users.getUser as jest.Mock;

describe('/api/stories/[id]/comments - Integration Tests', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    await clearDB();
    mockGetUser.mockClear();
  });

  describe('GET /api/stories/[id]/comments', () => {
    it('should return empty array for story with no comments', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return comments for a story', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, {
        content: 'Great story!',
      });
      await createTestComment(story._id.toString(), MOCK_USERS.CHARLIE, {
        content: 'I loved it!',
      });

      // Mock Clerk user data
      // Note: The route enriches users in the order they appear in authorIds array
      // which comes from Array.from(new Set(comments.map(c => c.authorId)))
      // Since comments are sorted by createdAt desc, Charlie's comment is first,
      // so Charlie's authorId appears first in the Set
      mockGetUser
        .mockResolvedValueOnce({
          id: MOCK_USERS.CHARLIE,
          firstName: 'Charlie',
          lastName: 'Brown',
          imageUrl: 'https://example.com/charlie.jpg',
        })
        .mockResolvedValueOnce({
          id: MOCK_USERS.BOB,
          firstName: 'Bob',
          lastName: 'Smith',
          imageUrl: 'https://example.com/bob.jpg',
        });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);

      // Comments should be sorted by createdAt descending (most recent first)
      expect(data[0].content).toBe('I loved it!');
      expect(data[0].authorName).toBe('Charlie Brown');
      expect(data[0].authorImage).toBe('https://example.com/charlie.jpg');

      expect(data[1].content).toBe('Great story!');
      expect(data[1].authorName).toBe('Bob Smith');
      expect(data[1].authorImage).toBe('https://example.com/bob.jpg');
    });

    it('should handle comments sorted by createdAt descending', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });

      await createTestComment(story._id.toString(), MOCK_USERS.BOB, {
        content: 'First comment',
      });

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      await createTestComment(story._id.toString(), MOCK_USERS.CHARLIE, {
        content: 'Second comment',
      });

      mockGetUser.mockResolvedValue({
        id: MOCK_USERS.BOB,
        firstName: 'User',
        imageUrl: null,
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      // Most recent comment should be first
      expect(data[0].content).toBe('Second comment');
      expect(data[1].content).toBe('First comment');
    });

    it('should enrich comments with author information from Clerk', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, {
        content: 'Test comment',
      });

      mockGetUser.mockResolvedValue({
        id: MOCK_USERS.BOB,
        firstName: 'Bob',
        lastName: 'Builder',
        imageUrl: 'https://example.com/bob.png',
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        content: 'Test comment',
        authorId: MOCK_USERS.BOB,
        authorName: 'Bob Builder',
        authorImage: 'https://example.com/bob.png',
      });
      expect(mockGetUser).toHaveBeenCalledWith(MOCK_USERS.BOB);
    });

    it('should handle Clerk API errors gracefully', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, {
        content: 'Test comment',
      });

      // Simulate Clerk API failure
      mockGetUser.mockRejectedValue(new Error('Clerk API error'));

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].content).toBe('Test comment');
      expect(data[0].authorName).toBeNull();
      expect(data[0].authorImage).toBeNull();
    });

    it('should use fullName if firstName/lastName not available', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, {
        content: 'Test comment',
      });

      mockGetUser.mockResolvedValue({
        id: MOCK_USERS.BOB,
        fullName: 'Bob The Builder',
        imageUrl: null,
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data[0].authorName).toBe('Bob The Builder');
    });

    it('should use email if no name available', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, {
        content: 'Test comment',
      });

      mockGetUser.mockResolvedValue({
        id: MOCK_USERS.BOB,
        primaryEmailAddress: {
          emailAddress: 'bob@example.com',
        },
        imageUrl: null,
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data[0].authorName).toBe('bob@example.com');
    });

    it('should deduplicate author API calls for same user', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, { content: 'Comment 1' });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, { content: 'Comment 2' });
      await createTestComment(story._id.toString(), MOCK_USERS.BOB, { content: 'Comment 3' });

      mockGetUser.mockResolvedValue({
        id: MOCK_USERS.BOB,
        firstName: 'Bob',
        imageUrl: null,
      });

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`);
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await GET(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      // Should only call Clerk once for the same user
      expect(mockGetUser).toHaveBeenCalledTimes(1);
      expect(mockGetUser).toHaveBeenCalledWith(MOCK_USERS.BOB);
    });
  });

  describe('POST /api/stories/[id]/comments', () => {
    it('should create comment with authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({
          content: 'This is a great story!',
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await POST(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.content).toBe('This is a great story!');
      expect(data.authorId).toBe(MOCK_USERS.BOB);
      expect(data.storyId.toString()).toBe(story._id.toString());

      // Verify comment was saved in database
      const Comment = (await import('@/models/Comment')).default;
      const savedComment = await Comment.findById(data._id);
      expect(savedComment).not.toBeNull();
      expect(savedComment?.content).toBe('This is a great story!');
    });

    it('should return 401 without authentication', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: 'Unauthorized comment',
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await POST(req, { params });

      // Assert
      expect(response.status).toBe(401);
      const text = await response.text();
      expect(text).toBe('Unauthorized');
    });

    it('should allow any authenticated user to comment on any published story', async () => {
      // Arrange - Alice's story
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });

      // Act - Bob comments on Alice's story
      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({
          content: 'Bob commenting on Alice\'s story',
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      const response = await POST(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.authorId).toBe(MOCK_USERS.BOB);
      expect(data.storyId.toString()).toBe(story._id.toString());
    });

    it('should handle long comment content', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      const longContent = 'A'.repeat(1000); // 1000 characters

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({
          content: longContent,
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await POST(req, { params });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.content).toBe(longContent);
      expect(data.content.length).toBe(1000);
    });

    it('should automatically set createdAt timestamp', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });
      const beforeCreate = new Date();

      const req = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({
          content: 'Test comment',
        }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      // Act
      const response = await POST(req, { params });
      const data = await response.json();
      const afterCreate = new Date();

      // Assert
      expect(response.status).toBe(200);
      expect(data.createdAt).toBeDefined();
      const createdAt = new Date(data.createdAt);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should allow multiple comments from same user', async () => {
      // Arrange
      const story = await createTestStory(MOCK_USERS.ALICE, { published: true });

      // Act - Bob creates multiple comments
      const req1 = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({ content: 'First comment' }),
      });
      const req2 = createMockRequest(`http://localhost:3000/api/stories/${story._id}/comments`, {
        method: 'POST',
        userId: MOCK_USERS.BOB,
        body: JSON.stringify({ content: 'Second comment' }),
      });
      const params = Promise.resolve({ id: story._id.toString() });

      const response1 = await POST(req1, { params });
      const response2 = await POST(req2, { params });

      // Assert
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const Comment = (await import('@/models/Comment')).default;
      const comments = await Comment.find({ storyId: story._id, authorId: MOCK_USERS.BOB });
      expect(comments).toHaveLength(2);
    });
  });
});
