'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import useMyStories from '@/hooks/useMyStories';
import useMyStoriesPaged from '@/hooks/useMyStoriesPaged';
import EditorLayout from '@/components/Editor/EditorLayout';
import Button from '@/components/Editor/Shared/Button';
import MineSidebar from '@/components/Stories/MineSidebar';
import ContentCard from '@/components/Common/ContentCard';
import StoriesContent from '@/components/Stories/StoriesContent';
import Hero from '@/components/Common/Hero';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';

export default function MyStories() {
  const { stories, loading, unauthorized, deleteStory, deleteAll, refresh } = useMyStories();
  const paged = useMyStoriesPaged({ requestedPageSize: 10 });

  const pagedStories = paged.stories;

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    const ok = await deleteStory(id);
    if (!ok) alert('Failed to delete story');
  };

  return (
    <EditorLayout>
      <Navbar />
      <StoriesShell
        title="My Stories"
        headerActions={(
          <Link href="/story/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm">Create New Story</Button>
          </Link>
        )}
        sidebar={(
          <StoriesSidebar>
            <MineSidebar
              storiesCount={stories.length}
              onClear={async () => {
                if (!confirm('Delete ALL your stories? This cannot be undone.')) return;
                const ok = await deleteAll();
                if (ok) {
                  alert('Deleted all stories');
                } else {
                  alert('Failed to delete stories');
                }
              }}
              onImported={async () => {
                try {
                  await refresh();
                  try { await paged.refresh(); } catch (e) { /* ignore paged refresh errors */ }
                } catch (err) { try { /* ignore */ } catch (e) { } }
              }}
            />
          </StoriesSidebar>
        )}
        hero={(
          <Hero gradientClass="bg-gradient-to-r from-green-50 to-white" borderClass="border-green-100">
            <h2 className="text-2xl font-semibold text-gray-900">Your personal workspace</h2>
            <p className="text-sm text-gray-600 mt-2">Draft and manage your stories here. Only you can see them until you publish.</p>
          </Hero>
        )}
        mainClass="flex-1 p-6 flex flex-col min-h-0"
      >
        <ContentCard className="flex-1">
          <div className="p-6 flex-1 overflow-y-auto min-h-0">
            <StoriesContent
              loading={paged.loading}
              unauthorized={paged.unauthorized || unauthorized}
              stories={pagedStories}
              onDelete={handleDelete}
              allowDelete={true}
              showYoursBadge={false}
              pageSize={paged.pageSize}
              serverPaged={true}
              total={paged.total}
              page={paged.page}
              onPageChange={paged.setPage}
              onPageSizeChange={paged.setPageSize}
              emptyMessage={(
                <span>You have no stories yet. <Link href="/story/new" className="text-blue-600">Create one</Link>.</span>
              )}
            />
          </div>
        </ContentCard>
      </StoriesShell>
    </EditorLayout>
  );
}