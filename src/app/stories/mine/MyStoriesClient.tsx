'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StoryType from '@/types/story';
import { deleteStoryAction } from '@/app/actions';
import StoriesContent from '@/components/Stories/StoriesContent';

interface MyStoriesClientProps {
  initialStories: StoryType[];
  total: number;
  page: number;
  limit: number;
}

export default function MyStoriesClient({
  initialStories,
  total,
  page,
  limit,
}: MyStoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    startTransition(async () => {
      try {
        await deleteStoryAction(id);
        router.refresh();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Delete story error:', error);
        alert(`Failed to delete story: ${errorMessage}`);
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/stories/mine?page=${newPage}&limit=${limit}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    router.push(`/stories/mine?page=1&limit=${newSize}`);
  };

  return (
    <div className="p-6 flex-1 overflow-y-auto min-h-0">
      <StoriesContent
        loading={isPending}
        unauthorized={false}
        stories={initialStories}
        onDelete={handleDelete}
        allowDelete={true}
        showYoursBadge={false}
        pageSize={limit}
        serverPaged={true}
        total={total}
        page={page}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage={(
          <span>
            You have no stories yet.{' '}
            <Link href="/story/new" className="text-blue-600">
              Create one
            </Link>
            .
          </span>
        )}
      />
    </div>
  );
}
