import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Navbar from '@/components/Navbar';
import CommentsServer from '@/components/CommentsServer';
import { getStory } from '@/lib/data/stories';
import StoriesShell from '@/components/Stories/StoriesShell';
import ChapterViewer from '@/components/Story/ChapterViewer';
import StoryHero from '@/components/Story/StoryHero';
import StoryActions from '@/components/Story/StoryActions';
import clerkClient from '@/lib/clerk';

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  const story = await getStory(id);
  if (!story) notFound();

  // Resolve human-readable author name via Clerk server-side client when possible
  let authorName: string | null = null;
  try {
    if (process.env.CLERK_SECRET_KEY && story.authorId) {
      const u = await clerkClient.users.getUser(story.authorId);
      authorName = (u?.firstName || u?.lastName) ? `${u?.firstName || ''} ${u?.lastName || ''}`.trim() : u?.fullName || u?.primaryEmailAddress?.emailAddress || null;
    }
  } catch {
    // ignore and fallback to authorId
    authorName = null;
  }

  const allChapters = (story.chapters || []);

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <StoriesShell
        hero={(
          <StoryHero
            initialTitle={story.title}
            actions={<StoryActions storyId={story._id} initialBravos={story.bravos?.length ?? 0} userBravos={story.bravos ?? []} authorId={story.authorId} userId={userId} />}
          />
        )}
      >
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <ChapterViewer
              chapters={allChapters.map((c) => ({ title: c.title, content: c.content, published: Boolean(c.published) }))}
              initialIndex={0}
              title={story.title}
              authorId={story.authorId}
              authorName={authorName || story.authorId || null}
              createdAt={story.createdAt || null}
              description={story.description || null}
              userId={userId}
            />
          </div>

          <aside className="md:col-span-1">
            <div className="sticky top-0">
              <CommentsServer storyId={story._id} />
            </div>
          </aside>
        </div>
      </StoriesShell>
    </div>
  );
}