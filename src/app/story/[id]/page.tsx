import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Comments from '@/components/Comments';

import StoriesShell from '@/components/Stories/StoriesShell';
import ContentCard from '@/components/Common/ContentCard';
import ChapterViewer from '@/components/Story/ChapterViewer';
import StoryHero from '@/components/Story/StoryHero';
import type { Story } from '@/types/story';
import clerkClient from '@/lib/clerk';

async function getStory(id: string): Promise<Story | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const story = await getStory(id);
  if (!story) notFound();

  // Resolve human-readable author name via Clerk server-side client when possible
  let authorName: string | null = null;
  try {
    if (process.env.CLERK_SECRET_KEY && story.authorId) {
      const u: any = await clerkClient.users.getUser(story.authorId);
      authorName = (u?.firstName || u?.lastName) ? `${u?.firstName || ''} ${u?.lastName || ''}`.trim() : u?.fullName || u?.primaryEmailAddress?.emailAddress || null;
    }
  } catch (e) {
    // ignore and fallback to authorId
    authorName = null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <StoriesShell
        hero={(
          <StoryHero initialTitle={story.title} />
        )}
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-4">
            <ChapterViewer
              chapters={(story.chapters || []).map(c => ({ title: c.title, content: c.content }))}
              initialIndex={0}
              title={story.title}
              authorName={authorName || story.authorId || null}
              createdAt={story.createdAt || null}
              chapterCount={story.chapterCount ?? (story.chapters ? story.chapters.length : 0)}
              description={story.description || null}
            />

            <div className="mt-8">
              <Comments storyId={story._id} />
            </div>
          </div>
        </div>
      </StoriesShell>
    </div>
  );
}