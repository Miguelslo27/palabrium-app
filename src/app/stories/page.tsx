"use client";

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import type { Story } from '@/types/story';
import ContentCard from '@/components/Common/ContentCard';
import Hero from '@/components/Common/Hero';
import CategoriesSidebar from '@/components/Stories/CategoriesSidebar';
import StoriesShell from '@/components/Stories/StoriesShell';
import StoriesSidebar from '@/components/Stories/StoriesSidebar';
import StoriesContent from '@/components/Stories/StoriesContent';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';

export default function Stories() {
  const [q, setQ] = useState('');

  const {
    itemsForPage,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    isLoading,
    isPrefetching,
    refresh,
  } = useBufferedPagedStories({ endpoint: '/api/stories', filters: { q }, requestedPageSize: 10, batchSize: 50, prefetchThreshold: 1 });

  const filtered = itemsForPage; // already filtered by server q param when provided

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      try { await refresh(); } catch (e) { /* ignore */ }
    } else {
      alert('Failed to delete story');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <StoriesShell
        title="Stories"
        headerActions={(
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stories..."
              aria-label="Search stories"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        )}
        sidebar={<StoriesSidebar><CategoriesSidebar /></StoriesSidebar>}
        hero={(
          <Hero gradientClass="bg-gradient-to-r from-blue-50 to-white" borderClass="border-blue-100">
            <h2 className="text-2xl font-semibold text-gray-900">Discover stories created by the community</h2>
            <p className="text-sm text-gray-600 mt-2">Explore, read and get inspired. Create your own story and share it with others.</p>
          </Hero>
        )}
      >
        <ContentCard className="flex-1">
          <div className="p-6 flex-1 min-h-0">
            <StoriesContent
              loading={isLoading}
              stories={filtered}
              onDelete={handleDelete}
              pageSize={pageSize}
              // server-paged controlled mode
              serverPaged={true}
              total={total}
              page={page}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </ContentCard>
      </StoriesShell>
    </div>
  );
}
