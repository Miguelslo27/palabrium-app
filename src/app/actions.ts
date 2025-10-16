/**
 * Server Actions for mutations
 * Use with useTransition() in Client Components for optimistic updates
 */

'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import * as storiesData from '@/lib/data/stories';
import * as chaptersData from '@/lib/data/chapters';
import * as commentsData from '@/lib/data/comments';

// ============================================================================
// STORY ACTIONS
// ============================================================================

export async function createStoryAction(data: { title: string; description?: string }) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const story = await storiesData.createStory(data, userId);

  revalidatePath('/stories/mine');
  revalidatePath('/stories');

  return story;
}

export async function updateStoryAction(
  storyId: string,
  data: { title?: string; description?: string; published?: boolean }
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const story = await storiesData.updateStory(storyId, data, userId);

  revalidatePath(`/story/${storyId}`);
  revalidatePath('/stories/mine');
  revalidatePath('/stories');

  return story;
}

export async function deleteStoryAction(storyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  console.log('Deleting story in action:', storyId, 'for user:', userId);

  try {
    await storiesData.deleteStory(storyId, userId);
    console.log('Story deleted successfully');
  } catch (error) {
    console.error('Error in deleteStory data layer:', error);
    throw error;
  }

  revalidatePath('/stories/mine');
  revalidatePath('/stories');
  revalidatePath('/');

  return { success: true };
}

export async function deleteAllStoriesAction() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await storiesData.deleteAllStories(userId);

  revalidatePath('/stories/mine');
  revalidatePath('/stories');

  return { success: true };
}

export async function toggleBravoAction(storyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const result = await storiesData.toggleBravo(storyId, userId);

  revalidatePath(`/story/${storyId}`);
  revalidatePath('/stories');

  return result;
}

export async function publishStoryAction(storyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const story = await storiesData.publishStory(storyId, userId);

  revalidatePath(`/story/${storyId}`);
  revalidatePath('/stories/mine');
  revalidatePath('/stories');

  return story;
}

export async function unpublishStoryAction(storyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const story = await storiesData.unpublishStory(storyId, userId);

  revalidatePath(`/story/${storyId}`);
  revalidatePath('/stories/mine');
  revalidatePath('/stories');

  return story;
}

// ============================================================================
// CHAPTER ACTIONS
// ============================================================================

export async function createChapterAction(data: {
  storyId: string;
  title: string;
  content: string;
  order?: number;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const chapter = await chaptersData.createChapter(data, userId);

  revalidatePath(`/story/${data.storyId}`);
  revalidatePath(`/story/${data.storyId}/edit`);

  return chapter;
}

export async function updateChapterAction(
  chapterId: string,
  data: {
    title?: string;
    content?: string;
    order?: number;
    published?: boolean;
  }
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const chapter = await chaptersData.updateChapter(chapterId, data, userId);

  revalidatePath(`/story/${chapter.storyId}`);
  revalidatePath(`/story/${chapter.storyId}/edit`);

  return chapter;
}

export async function deleteChapterAction(chapterId: string, storyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await chaptersData.deleteChapter(chapterId, userId);

  revalidatePath(`/story/${storyId}`);
  revalidatePath(`/story/${storyId}/edit`);

  return { success: true };
}

export async function togglePublishChapterAction(chapterId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const chapter = await chaptersData.togglePublishChapter(chapterId, userId);

  revalidatePath(`/story/${chapter.storyId}`);
  revalidatePath(`/story/${chapter.storyId}/edit`);

  return chapter;
}

export async function reorderChaptersAction(storyId: string, chapterIds: string[]) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await chaptersData.reorderChapters(storyId, chapterIds, userId);

  revalidatePath(`/story/${storyId}`);
  revalidatePath(`/story/${storyId}/edit`);

  return { success: true };
}

// ============================================================================
// COMMENT ACTIONS
// ============================================================================

export async function addCommentAction(storyId: string, content: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const comment = await commentsData.addComment(storyId, userId, content);

  revalidatePath(`/story/${storyId}`);

  return comment;
}

export async function deleteCommentAction(commentId: string, storyId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  await commentsData.deleteComment(commentId, userId);

  revalidatePath(`/story/${storyId}`);

  return { success: true };
}
