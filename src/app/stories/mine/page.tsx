import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getMyStories } from '@/lib/data/stories';
import Navbar from '@/components/Navbar';
import EditorLayout from '@/components/Editor/EditorLayout';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';
import Hero from '@/components/Common/Hero';
import MyStoriesClient from './MyStoriesClient';
import MyStoriesSidebarClient from './MyStoriesSidebarClient';
import Link from 'next/link';

export default async function MyStoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect=/stories/mine');
  }

  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const skip = (page - 1) * limit;

  const { stories, total } = await getMyStories(userId, { skip, limit });

  return (
    <EditorLayout>
      <Navbar />
      <StoriesShell
        title="My Stories"
        headerActions={(
          <Link
            href="/story/new"
            className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Create New Story
          </Link>
        )}
        sidebar={(
          <StoriesSidebar>
            <MyStoriesSidebarClient storiesCount={stories.length} />
          </StoriesSidebar>
        )}
        hero={(
          <Hero gradientClass="bg-gradient-to-r from-green-50 to-white" borderClass="border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">Your personal workspace</h2>
            <p className="text-sm text-gray-600 mt-2">
              Draft and manage your stories here. Only you can see them until you publish.
            </p>
          </Hero>
        )}
        mainClass="flex-1 p-6 flex flex-col min-h-0"
      >
        <div className="flex-1">
          <div className="bg-white border border-gray-300 rounded shadow-sm min-h-0 flex flex-col">
            <MyStoriesClient
              initialStories={stories}
              total={total}
              page={page}
              limit={limit}
            />
          </div>
        </div>
      </StoriesShell>
    </EditorLayout>
  );
}
