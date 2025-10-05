/**
 * Server-side data layer for Chapters
 * Direct MongoDB access without API routes
 * To be used in Server Components and Server Actions only
 */

import dbConnect from '@/lib/mongodb';
import Chapter from '@/models/Chapter';
import Story from '@/models/Story';

export interface ChapterData {
  _id: string;
  storyId: string;
  title: string;
  content: string;
  order: number;
  published: boolean;
  publishedAt?: Date | null;
  unPublishedAt?: Date | null;
  publishedBy?: string | null;
  unPublishedBy?: string | null;
  createdAt: Date;
}

/**
 * Get all chapters for a story
 */
export async function getChapters(storyId: string): Promise<ChapterData[]> {
  await dbConnect();

  const chapters = await Chapter.find({ storyId })
    .sort({ order: 1 })
    .lean()
    .exec();

  return chapters.map((ch: any) => ({
    ...ch,
    _id: ch._id.toString(),
    storyId: ch.storyId.toString(),
  })) as ChapterData[];
}

/**
 * Get a single chapter by ID
 */
export async function getChapter(chapterId: string): Promise<ChapterData | null> {
  await dbConnect();

  const chapter: any = await Chapter.findById(chapterId).lean().exec();

  if (!chapter) {
    return null;
  }

  return {
    ...chapter,
    _id: chapter._id.toString(),
    storyId: chapter.storyId.toString(),
  } as ChapterData;
}

/**
 * Create a new chapter
 */
export async function createChapter(
  data: {
    storyId: string;
    title: string;
    content: string;
    order?: number;
  },
  userId: string
): Promise<ChapterData> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  // Verify user owns the story
  const story = await Story.findById(data.storyId);

  if (!story) {
    throw new Error('Story not found');
  }

  if (story.authorId !== userId) {
    throw new Error('Unauthorized: You can only add chapters to your own stories');
  }

  // If order not provided, get the max order + 1
  let order = data.order ?? 0;
  if (data.order === undefined) {
    const lastChapter = await Chapter.findOne({ storyId: data.storyId })
      .sort({ order: -1 })
      .exec();
    order = lastChapter ? lastChapter.order + 1 : 0;
  }

  const chapter = await Chapter.create({
    storyId: data.storyId,
    title: data.title,
    content: data.content,
    order,
    published: false,
  });

  // Update story chapter count
  await Story.findByIdAndUpdate(data.storyId, {
    $inc: { chapterCount: 1 },
  });

  return {
    ...chapter.toObject(),
    _id: chapter._id.toString(),
    storyId: chapter.storyId.toString(),
  } as ChapterData;
}

/**
 * Update an existing chapter
 */
export async function updateChapter(
  chapterId: string,
  data: {
    title?: string;
    content?: string;
    order?: number;
    published?: boolean;
  },
  userId: string
): Promise<ChapterData> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    throw new Error('Chapter not found');
  }

  // Verify user owns the story
  const story = await Story.findById(chapter.storyId);

  if (!story || story.authorId !== userId) {
    throw new Error('Unauthorized: You can only edit chapters in your own stories');
  }

  // Update fields
  if (data.title !== undefined) chapter.title = data.title;
  if (data.content !== undefined) chapter.content = data.content;
  if (data.order !== undefined) chapter.order = data.order;

  // Handle published status
  if (data.published !== undefined && data.published !== chapter.published) {
    chapter.published = data.published;
    if (data.published) {
      chapter.publishedAt = new Date();
      chapter.publishedBy = userId;
    } else {
      chapter.unPublishedAt = new Date();
      chapter.unPublishedBy = userId;
    }
  }

  await chapter.save();

  return {
    ...chapter.toObject(),
    _id: chapter._id.toString(),
    storyId: chapter.storyId.toString(),
  } as ChapterData;
}

/**
 * Delete a chapter
 */
export async function deleteChapter(chapterId: string, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    throw new Error('Chapter not found');
  }

  // Verify user owns the story
  const story = await Story.findById(chapter.storyId);

  if (!story || story.authorId !== userId) {
    throw new Error('Unauthorized: You can only delete chapters from your own stories');
  }

  // Delete the chapter
  await Chapter.findByIdAndDelete(chapterId);

  // Update story chapter count
  await Story.findByIdAndUpdate(chapter.storyId, {
    $inc: { chapterCount: -1 },
  });
}

/**
 * Toggle publish status of a chapter
 */
export async function togglePublishChapter(
  chapterId: string,
  userId: string
): Promise<ChapterData> {
  await dbConnect();

  const chapter = await Chapter.findById(chapterId);

  if (!chapter) {
    throw new Error('Chapter not found');
  }

  // Verify user owns the story
  const story = await Story.findById(chapter.storyId);

  if (!story || story.authorId !== userId) {
    throw new Error('Unauthorized');
  }

  return updateChapter(chapterId, { published: !chapter.published }, userId);
}

/**
 * Reorder chapters
 */
export async function reorderChapters(
  storyId: string,
  chapterIds: string[],
  userId: string
): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  // Verify user owns the story
  const story = await Story.findById(storyId);

  if (!story || story.authorId !== userId) {
    throw new Error('Unauthorized');
  }

  // Update order for each chapter
  const updates = chapterIds.map((chapterId, index) =>
    Chapter.findByIdAndUpdate(chapterId, { order: index })
  );

  await Promise.all(updates);
}
