/**
 * Fixtures for integration tests
 * 
 * Provides factory functions for creating test data
 */

import Story from '@/models/Story';
import Chapter from '@/models/Chapter';
import Comment from '@/models/Comment';
import User from '@/models/User';
import { MOCK_USERS } from './auth';

/**
 * Create a test user in the database
 */
export async function createTestUser(userId: string, data: Partial<any> = {}) {
  return await User.create({
    clerkId: userId,
    email: data.email || `${userId}@test.com`,
    username: data.username || userId.replace('user-', ''),
    firstName: data.firstName || 'Test',
    lastName: data.lastName || 'User',
    photo: data.photo || '',
    ...data,
  });
}

/**
 * Create a test story in the database
 */
export async function createTestStory(userId: string, data: Partial<any> = {}) {
  return await Story.create({
    title: data.title || 'Test Story',
    description: data.description || 'Test Description',
    authorId: userId,
    published: data.published ?? false,
    tags: data.tags || [],
    coverImage: data.coverImage || '',
    language: data.language || 'es',
    genre: data.genre || 'fantasy',
    ...data,
  });
}

/**
 * Create a test chapter in the database
 */
export async function createTestChapter(storyId: string, data: Partial<any> = {}) {
  return await Chapter.create({
    storyId: storyId,
    title: data.title || 'Test Chapter',
    content: data.content || 'Test Content',
    order: data.order ?? 0,
    published: data.published ?? false,
    ...data,
  });
}

/**
 * Create a test comment in the database
 */
export async function createTestComment(storyId: string, userId: string, data: Partial<any> = {}) {
  return await Comment.create({
    storyId: storyId,
    authorId: userId,
    content: data.content || 'Test Comment',
    ...data,
  });
}

/**
 * Create multiple test stories for a user
 */
export async function createMultipleStories(userId: string, count: number) {
  const stories = [];
  for (let i = 0; i < count; i++) {
    const story = await createTestStory(userId, {
      title: `Test Story ${i + 1}`,
      description: `Description for story ${i + 1}`,
    });
    stories.push(story);
  }
  return stories;
}

/**
 * Create a complete story with chapters
 */
export async function createStoryWithChapters(
  userId: string,
  chapterCount: number = 3,
  storyData: Partial<any> = {}
) {
  const story = await createTestStory(userId, storyData);
  
  const chapters = [];
  for (let i = 0; i < chapterCount; i++) {
    const chapter = await createTestChapter(story._id.toString(), {
      title: `Chapter ${i + 1}`,
      content: `Content for chapter ${i + 1}`,
      order: i,
    });
    chapters.push(chapter);
  }

  return { story, chapters };
}

/**
 * Create a published story with comments
 */
export async function createStoryWithComments(
  authorId: string,
  commentCount: number = 3
) {
  const story = await createTestStory(authorId, { published: true });
  
  const comments = [];
  const commentUsers = [MOCK_USERS.ALICE, MOCK_USERS.BOB, MOCK_USERS.CHARLIE];
  
  for (let i = 0; i < commentCount; i++) {
    const userId = commentUsers[i % commentUsers.length];
    const comment = await createTestComment(story._id.toString(), userId, {
      content: `Test comment ${i + 1}`,
    });
    comments.push(comment);
  }

  return { story, comments };
}
