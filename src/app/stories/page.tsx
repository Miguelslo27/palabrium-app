import { getStories } from '@/lib/data/stories';
import Navbar from '@/components/Navbar';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';
import CategoriesSidebar from '@/components/Stories/CategoriesSidebar';
import Hero from '@/components/Common/Hero';
import StoriesExploreClient from './StoriesExploreClient';
import StoriesExploreSearchClient from './StoriesExploreSearchClient';

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; q?: string }>;
}) {
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
      <StoriesShell
        title="Stories"
        headerActions={(
          <StoriesExploreSearchClient initialQuery={q} limit={limit} />
        )}
        sidebar={(
          <StoriesSidebar>
            <CategoriesSidebar />
          </StoriesSidebar>
        )}
        hero={(
          <Hero gradientClass="bg-gradient-to-r from-blue-50 to-white" borderClass="border-blue-100">
            <h2 className="text-2xl font-semibold text-gray-900">
              Discover stories created by the community
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Explore, read and get inspired. Create your own story and share it with others.
            </p>
          </Hero>
        )}
      >
        <div className="flex-1">
          <div className="bg-white border border-gray-300 rounded shadow-sm min-h-0 flex flex-col">
            <StoriesExploreClient
              initialStories={stories}
              total={total}
              page={page}
              limit={limit}
              initialQuery={q}
            />
          </div>
        </div>
      </StoriesShell>
    </div>
  );
}
