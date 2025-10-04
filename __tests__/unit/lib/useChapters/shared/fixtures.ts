/**
 * Shared test fixtures for useChapters tests
 */

export const mockChapterData = {
  _id: 'chapter-123',
  storyId: 'story-456',
  title: 'Test Chapter',
  content: 'Chapter content',
  order: 1,
  published: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export const mockChapterArray = [
  mockChapterData,
  {
    _id: 'chapter-124',
    storyId: 'story-456',
    title: 'Test Chapter 2',
    content: 'Chapter 2 content',
    order: 2,
    published: true,
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02',
  },
];
