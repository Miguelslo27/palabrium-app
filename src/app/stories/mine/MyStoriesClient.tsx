'use client';

import React, { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StoryType from '@/types/story';
import { deleteStoryAction, deleteAllStoriesAction } from '@/app/actions';
import Button from '@/components/Editor/Shared/Button';
import MineSidebar from '@/components/Stories/MineSidebar';
import ContentCard from '@/components/Common/ContentCard';
import StoriesContent from '@/components/Stories/StoriesContent';
import Hero from '@/components/Common/Hero';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';

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
        alert('Failed to delete story');
        console.error('Delete story error:', error);
      }
    });
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL your stories? This cannot be undone.')) return;

    startTransition(async () => {
      try {
        await deleteAllStoriesAction();
        router.refresh();
        alert('Deleted all stories');
      } catch (error) {
        alert('Failed to delete stories');
        console.error('Delete all stories error:', error);
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    router.push(`/stories/mine?page=${newPage}&limit=${limit}`);
  };

  const handlePageSizeChange = (newSize: number) => {
    router.push(`/stories/mine?page=1&limit=${newSize}`);
  };

  const handleImported = () => {
    router.refresh();
  };

  return (
    <StoriesShell
      title="My Stories"
      headerActions={(
        <Link href="/story/new">
          <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm">
            Create New Story
          </Button>
        </Link>
      )}
      sidebar={(
        <StoriesSidebar>
          <MineSidebar
            storiesCount={initialStories.length}
            onClear={handleDeleteAll}
            onImported={handleImported}
          />
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
      <ContentCard className="flex-1">
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
      </ContentCard>
    </StoriesShell>
  );
}
