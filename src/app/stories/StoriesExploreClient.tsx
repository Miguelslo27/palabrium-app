'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import StoryType from '@/types/story';
import { deleteStoryAction } from '@/app/actions';
import ContentCard from '@/components/Common/ContentCard';
import Hero from '@/components/Common/Hero';
import CategoriesSidebar from '@/components/Stories/CategoriesSidebar';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';
import StoriesContent from '@/components/Stories/StoriesContent';

interface StoriesExploreClientProps {
  initialStories: StoryType[];
  total: number;
  page: number;
  limit: number;
  initialQuery: string;
  userId: string | null;
}

export default function StoriesExploreClient({
  initialStories,
  total,
  page,
  limit,
  initialQuery,
  userId,
}: StoriesExploreClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    // Debounce o búsqueda inmediata - por ahora inmediata
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', limit.toString());
    if (newQuery) {
      params.set('q', newQuery);
    }
    router.push(`/stories?${params.toString()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    
    startTransition(async () => {
      try {
        await deleteStoryAction(id);
        router.refresh();
      } catch (error) {
        alert('Failed to delete story');
        console.error('Delete story error:', error);
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams();
    params.set('page', newPage.toString());
    params.set('limit', limit.toString());
    if (query) {
      params.set('q', query);
    }
    router.push(`/stories?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', newSize.toString());
    if (query) {
      params.set('q', query);
    }
    router.push(`/stories?${params.toString()}`);
  };

  return (
    <StoriesShell
      title="Stories"
      headerActions={(
        <div className="flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search stories..."
            aria-label="Search stories"
            className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      )}
      sidebar={
        <StoriesSidebar>
          <CategoriesSidebar />
        </StoriesSidebar>
      }
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
      <ContentCard className="flex-1">
        <div className="p-6 flex-1 min-h-0">
          <StoriesContent
            loading={isPending}
            stories={initialStories}
            onDelete={handleDelete}
            pageSize={limit}
            serverPaged={true}
            total={total}
            page={page}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </ContentCard>
    </StoriesShell>
  );
}
