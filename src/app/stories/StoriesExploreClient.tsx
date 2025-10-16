'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import StoryType from '@/types/story';
import { deleteStoryAction } from '@/app/actions';
import StoriesContent from '@/components/Stories/StoriesContent';

interface StoriesExploreClientProps {
  initialStories: StoryType[];
  total: number;
  page: number;
  limit: number;
  initialQuery: string;
}

export default function StoriesExploreClient({
  initialStories,
  total,
  page,
  limit,
  initialQuery,
}: StoriesExploreClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  const buildSearchParams = (params: { page?: number; limit?: number }) => {
    const search = new URLSearchParams();
    search.set('limit', (params.limit ?? limit).toString());
    search.set('page', (params.page ?? page).toString());
    if (initialQuery) {
      search.set('q', initialQuery);
    }
    return search.toString();
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/stories?${buildSearchParams({ page: newPage })}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    router.push(`/stories?${buildSearchParams({ page: 1, limit: newSize })}`);
  };

  return (
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
  );
}
