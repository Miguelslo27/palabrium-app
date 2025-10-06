/**
 * Server-side data layer for Stories
 * Direct MongoDB access without API routes
 * To be used in Server Components and Server Actions only
 */

import dbConnect from '@/lib/mongodb';
import Story from '@/models/Story';
import Chapter from '@/models/Chapter';
import { Story as StoryType } from '@/types/story';

export interface GetStoriesOptions {
  skip?: number;
  limit?: number;
  q?: string; // search query
  authorId?: string; // filter by author
  published?: boolean; // filter by published status
}

export interface GetStoriesResult {
  stories: StoryType[];
  total: number;
}

/**
 * Get stories with pagination and filtering
 * Public stories only unless authorId specified
 */
export async function getStories(opts: GetStoriesOptions = {}): Promise<GetStoriesResult> {
  const { skip = 0, limit = 10, q, authorId, published = true } = opts;

  await dbConnect();

  // Build query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};

  // Filter by author if specified
  if (authorId) {
    query.authorId = authorId;
  } else {
    // Only show published stories for public view
    query.published = published;
  }

  // Search in title and description
  if (q && q.trim()) {
    query.$or = [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  // Execute query
  const [stories, total] = await Promise.all([
    Story.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Story.countDocuments(query),
  ]);

  // Get chapter count for each story
  const storiesWithChapters = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stories.map(async (story: any) => {
      const chapters = await Chapter.find({ storyId: story._id }).lean().exec();
      return {
        ...story,
        _id: story._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        chapters: chapters.map((ch: any) => ({
          ...ch,
          _id: ch._id.toString(),
          storyId: ch.storyId.toString(),
        })),
      };
    })
  );

  return {
    stories: storiesWithChapters as unknown as StoryType[],
    total,
  };
}

/**
 * Get stories for a specific user (authenticated)
 */
export async function getMyStories(
  userId: string,
  opts: { skip?: number; limit?: number } = {}
): Promise<GetStoriesResult> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return getStories({
    ...opts,
    authorId: userId,
    published: undefined, // Show both published and unpublished
  });
}

/**
 * Get a single story by ID with all its chapters
 */
export async function getStory(storyId: string): Promise<StoryType | null> {
  await dbConnect();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const story: any = await Story.findById(storyId).lean().exec();

  if (!story) {
    return null;
  }

  const chapters = await Chapter.find({ storyId: story._id })
    .sort({ order: 1 })
    .lean()
    .exec();

  return {
    ...story,
    _id: story._id.toString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapters: chapters.map((ch: any) => ({
      ...ch,
      _id: ch._id.toString(),
      storyId: ch.storyId.toString(),
    })),
  } as unknown as StoryType;
}

/**
 * Create a new story
 */
export async function createStory(
  data: { title: string; description?: string },
  userId: string
): Promise<StoryType> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const story = await Story.create({
    title: data.title,
    description: data.description || '',
    authorId: userId,
    chapterCount: 0,
    published: false,
  });

  return {
    ...story.toObject(),
    _id: story._id.toString(),
    chapters: [],
  } as StoryType;
}

/**
 * Update an existing story
 */
export async function updateStory(
  storyId: string,
  data: { title?: string; description?: string; published?: boolean },
  userId: string
): Promise<StoryType> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error('Story not found');
  }

  if (story.authorId !== userId) {
    throw new Error('Unauthorized: You can only edit your own stories');
  }

  // Update fields
  if (data.title !== undefined) story.title = data.title;
  if (data.description !== undefined) story.description = data.description;

  // Handle published status
  if (data.published !== undefined && data.published !== story.published) {
    story.published = data.published;
    if (data.published) {
      story.publishedAt = new Date();
      story.publishedBy = userId;
    } else {
      story.unPublishedAt = new Date();
      story.unPublishedBy = userId;
    }
  }

  await story.save();

  const chapters = await Chapter.find({ storyId: story._id })
    .sort({ order: 1 })
    .lean()
    .exec();

  return {
    ...story.toObject(),
    _id: story._id.toString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapters: chapters.map((ch: any) => ({
      ...ch,
      _id: ch._id.toString(),
      storyId: ch.storyId.toString(),
    })),
  } as StoryType;
}

/**
 * Delete a story and all its chapters
 */
export async function deleteStory(storyId: string, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error('Story not found');
  }

  if (story.authorId !== userId) {
    throw new Error('Unauthorized: You can only delete your own stories');
  }

  // Delete all chapters first
  await Chapter.deleteMany({ storyId: story._id });

  // Delete the story
  await Story.findByIdAndDelete(storyId);
}

/**
 * Delete all stories for a user
 */
export async function deleteAllStories(userId: string): Promise<void> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  // Find all user's stories
  const stories = await Story.find({ authorId: userId }).select('_id');
  const storyIds = stories.map((s) => s._id);

  // Delete all chapters for these stories
  await Chapter.deleteMany({ storyId: { $in: storyIds } });

  // Delete all stories
  await Story.deleteMany({ authorId: userId });
}

/**
 * Toggle bravo (like) on a story
 */
export async function toggleBravo(
  storyId: string,
  userId: string
): Promise<{ bravos: number; braved: boolean }> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  await dbConnect();

  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error('Story not found');
  }

  // Check if user already gave bravo
  const bravoIndex = story.bravos.indexOf(userId);
  let braved: boolean;

  if (bravoIndex > -1) {
    // Remove bravo
    story.bravos.splice(bravoIndex, 1);
    braved = false;
  } else {
    // Add bravo
    story.bravos.push(userId);
    braved = true;
  }

  await story.save();

  return { bravos: story.bravos.length, braved };
}

/**
 * Publish a story
 */
export async function publishStory(storyId: string, userId: string): Promise<StoryType> {
  return updateStory(storyId, { published: true }, userId);
}

/**
 * Unpublish a story
 */
export async function unpublishStory(storyId: string, userId: string): Promise<StoryType> {
  return updateStory(storyId, { published: false }, userId);
}
