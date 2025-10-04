/**
 * Test fixtures - Factory functions for creating test data
 * This file provides helpers to create test data with default values
 */

import type { Story } from '@/types/story';

// Story factory
export const createMockStory = (overrides?: Partial<Story>): Story => ({
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Story',
  description: 'This is a test story description',
  authorId: 'user_test123',
  published: false,
  publishedAt: null,
  unPublishedAt: null,
  publishedBy: null,
  unPublishedBy: null,
  bravos: [],
  chapters: [],
  chapterCount: 0,
  createdAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

// Chapter factory
export const createMockChapter = (overrides?: Partial<any>) => ({
  _id: '507f1f77bcf86cd799439012',
  storyId: '507f1f77bcf86cd799439011',
  title: 'Chapter 1',
  content: 'This is the content of chapter 1',
  order: 1,
  published: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  ...overrides,
});

// Comment factory
export const createMockComment = (overrides?: Partial<any>) => ({
  _id: '507f1f77bcf86cd799439013',
  storyId: '507f1f77bcf86cd799439011',
  authorId: 'user_test123',
  content: 'This is a test comment',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  authorName: 'Test User',
  authorImage: 'https://example.com/avatar.jpg',
  ...overrides,
});

// User factory
export const createMockUser = (overrides?: Partial<any>) => ({
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  imageUrl: 'https://example.com/avatar.jpg',
  primaryEmailAddress: {
    emailAddress: 'test@example.com',
  },
  ...overrides,
});

// Create multiple stories
export const createMockStories = (count: number, overrides?: Partial<Story>): Story[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockStory({
      _id: `story_${index}`,
      title: `Test Story ${index + 1}`,
      ...overrides,
    })
  );
};

// Create multiple chapters
export const createMockChapters = (count: number, storyId: string = '507f1f77bcf86cd799439011') => {
  return Array.from({ length: count }, (_, index) =>
    createMockChapter({
      _id: `chapter_${index}`,
      storyId,
      title: `Chapter ${index + 1}`,
      order: index + 1,
    })
  );
};

// Published story
export const createPublishedStory = (overrides?: Partial<Story>): Story =>
  createMockStory({
    published: true,
    publishedAt: '2025-01-01T00:00:00.000Z',
    publishedBy: 'user_test123',
    ...overrides,
  });

// Story with chapters
export const createStoryWithChapters = (chapterCount: number = 3): Story => {
  const chapters = createMockChapters(chapterCount).map((ch) => ({
    title: ch.title,
    content: ch.content,
    order: ch.order,
    published: ch.published,
  }));

  return createMockStory({
    chapters,
    chapterCount,
  });
};
