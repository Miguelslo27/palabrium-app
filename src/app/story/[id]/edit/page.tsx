import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import StoryFormClient from '@/components/Editor/StoryFormClient';
import EditorLayout from '@/components/Editor/EditorLayout';
import { getStory } from '@/lib/data/stories';

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect=/stories/mine');
  }

  const story = await getStory(id);

  if (!story || story.authorId !== userId) {
    redirect('/stories/mine');
  }

  const initialStory = {
    _id: story._id,
    title: story.title ?? '',
    description: story.description ?? '',
    published: Boolean(story.published),
    publishedAt: story.publishedAt ? new Date(story.publishedAt).toISOString() : null,
    unPublishedAt: story.unPublishedAt ? new Date(story.unPublishedAt).toISOString() : null,
    publishedBy: story.publishedBy ?? null,
    unPublishedBy: story.unPublishedBy ?? null,
  };

  const initialChapters = (story.chapters ?? []).map((chapter) => ({
    _id: chapter._id?.toString(),
    title: chapter.title ?? '',
    content: chapter.content ?? '',
    order: typeof chapter.order === 'number' ? chapter.order : 0,
    published: Boolean(chapter.published),
    publishedAt: chapter.publishedAt ? new Date(chapter.publishedAt).toISOString() : null,
    unPublishedAt: chapter.unPublishedAt ? new Date(chapter.unPublishedAt).toISOString() : null,
    publishedBy: chapter.publishedBy ?? null,
    unPublishedBy: chapter.unPublishedBy ?? null,
  }));

  return (
    <EditorLayout>
      <Navbar />
      <StoryFormClient
        mode="edit"
        storyId={story._id}
        initialStory={initialStory}
        initialChapters={initialChapters}
      />
    </EditorLayout>
  );
}
