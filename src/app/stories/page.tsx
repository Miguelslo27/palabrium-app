import { auth } from '@clerk/nextjs/server';
import { getStories } from '@/lib/data/stories';
import Navbar from '@/components/Navbar';
import StoriesExploreClient from './StoriesExploreClient';

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; q?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;

  const page = parseInt(params.page || '1');
  const limit = parseInt(params.limit || '10');
  const skip = (page - 1) * limit;
  const q = params.q || '';

  const { stories, total } = await getStories({
    skip,
    limit,
    q,
    published: true, // Solo historias publicadas en explore
  });

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <StoriesExploreClient
        initialStories={stories}
        total={total}
        page={page}
        limit={limit}
        initialQuery={q}
        userId={userId || null}
      />
    </div>
  );
}
