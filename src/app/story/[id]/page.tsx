import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LikeButton from '@/components/LikeButton';
import Comments from '@/components/Comments';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';
import ContentCard from '@/components/Common/ContentCard';
import type { Story } from '@/types/story';

async function getStory(id: string): Promise<Story | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stories/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function StoryPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const story = await getStory(id);
  if (!story) notFound();

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <StoriesShell
        title={story.title}
        sidebar={(
          <StoriesSidebar>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{story.title}</h2>
              <div className="text-sm text-gray-600 mb-3">
                <div>Author: {story.authorId || 'Unknown'}</div>
                <div>Created: {story.createdAt ? new Date(story.createdAt).toLocaleString() : '—'}</div>
                <div>Chapters: {story.chapterCount ?? (story.chapters ? story.chapters.length : 0)}</div>
              </div>
              <p className="text-sm text-gray-800 mb-4">{story.description}</p>

              <div>
                <h3 className="font-semibold mb-2">Chapters</h3>
                <ul className="space-y-2 text-sm">
                  {(story.chapters || []).map((chapter, idx) => (
                    <li key={idx} className="truncate">{idx + 1}. {chapter.title}</li>
                  ))}
                  {(!(story.chapters || []).length) && <li className="text-gray-500">No chapters yet</li>}
                </ul>
              </div>
            </div>
          </StoriesSidebar>
        )}
      >
        <ContentCard className="flex-1">
          <div className="p-6 flex-1 min-h-0">
            <div className="mb-4 flex items-start justify-between">
              <div>
                {/* Title intentionally omitted from main per design; it's in the sidebar */}
                <p className="text-sm text-gray-600">{story.description}</p>
              </div>
              <div>
                <LikeButton storyId={story._id} initialLikes={(story.likes || []).length} userLikes={story.likes || []} />
              </div>
            </div>

            {/* Render only the first chapter */}
            {((story.chapters || [])[0]) ? (
              <article>
                <h3 className="text-2xl font-bold mb-4">{(story.chapters || [])[0].title}</h3>
                <div className="prose max-w-none whitespace-pre-wrap">{(story.chapters || [])[0].content}</div>
              </article>
            ) : (
              <div className="text-gray-600">This story has no chapters yet.</div>
            )}

            <div className="mt-8">
              <Comments storyId={story._id} />
            </div>
          </div>
        </ContentCard>
      </StoriesShell>
    </div>
  );
}