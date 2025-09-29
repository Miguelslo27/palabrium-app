"use client";

import React, { useEffect, useState } from 'react';
import StoryList from '@/components/StoryList';
import StoriesToolbar from '@/components/Stories/StoriesToolbar';
import type { Story } from '@/types/story';

type Props = {
  loading: boolean;
  unauthorized?: boolean;
  stories: Story[];
  onDelete?: (id: string) => void;
  allowDelete?: boolean;
  emptyMessage?: React.ReactNode;
  // optional pagination: page size (defaults to 10) and initial page
  pageSize?: number;
  initialPage?: number;
};

export default function StoriesContent({ loading, unauthorized, stories, onDelete, allowDelete = false, emptyMessage, pageSize: pageSizeProp, initialPage = 1 }: Props) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState<number>(initialPage || 1);
  const [pageSize, setPageSize] = useState<number>(pageSizeProp || 10);

  useEffect(() => {
    try {
      const v = localStorage.getItem('stories.view');
      if (v === 'grid' || v === 'list') setView(v);
    } catch (e) {
      // ignore
    }
  }, []);

  // keep page within bounds if initial values change
  useEffect(() => {
    setPage((p) => Math.max(1, Math.min(p, Math.max(1, Math.ceil((stories?.length || 0) / (pageSize || 10))))));
  }, [stories.length, pageSize]);

  useEffect(() => {
    try {
      localStorage.setItem('stories.view', view);
    } catch (e) {
      // ignore
    }
  }, [view]);

  if (loading) return <div className="text-gray-600">Loading stories…</div>;
  if (unauthorized) return <div className="text-red-600">You must be signed in to see your stories.</div>;
  if (!stories || stories.length === 0) return <div className="text-gray-600">{emptyMessage ?? 'No stories found.'}</div>;

  // Determine pagination window
  const effectivePageSize = pageSize || 10;
  const total = stories.length;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * effectivePageSize;
  const pagedStories = stories.slice(start, start + effectivePageSize);

  return (
    <div>
      <StoriesToolbar
        count={stories.length}
        view={view}
        onChangeView={(v) => setView(v)}
        page={currentPage}
        totalPages={totalPages}
        pageSize={effectivePageSize}
        onChangePage={(p) => setPage(p)}
        onChangePageSize={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />

      <StoryList stories={pagedStories} onDelete={onDelete} allowDelete={allowDelete} view={view} />
    </div>
  );
}
