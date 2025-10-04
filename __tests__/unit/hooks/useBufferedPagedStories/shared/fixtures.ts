/**
 * Shared test fixtures for useBufferedPagedStories tests
 */

import type { Story } from '@/types/story';

/**
 * Create mock stories for testing
 */
export const createMockStories = (start: number, count: number): Story[] => {
  return Array.from({ length: count }, (_, i) => ({
    _id: `story${start + i}`,
    title: `Test Story ${start + i}`,
    description: `Description ${start + i}`,
    authorId: 'user123',
    chapters: [],
    published: true,
    createdAt: `2024-01-${String(start + i).padStart(2, '0')}`,
  }));
};

/**
 * Default mock response for successful fetch
 */
export const createMockResponse = (stories: Story[], total: number) => ({
  items: stories,
  total,
});
