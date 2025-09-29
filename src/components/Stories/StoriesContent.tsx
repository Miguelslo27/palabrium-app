"use client";

import React, { useEffect, useState } from 'react';
import StoriesToolbar from '@/components/Stories/StoriesToolbar';
import StoryList from '@/components/Story/StoryList';
import type { Story } from '@/types/story';

type Props = {
  loading: boolean;
  unauthorized?: boolean;
  stories: Story[];
  allowDelete?: boolean;
  emptyMessage?: React.ReactNode;
  pageSize?: number;
  initialPage?: number;
  serverPaged?: boolean;
  total?: number;
  page?: number;
  onDelete?: (id: string) => void;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (s: number) => void;
};

export default function StoriesContent({
  loading,
  unauthorized,
  stories,
  onDelete,
  allowDelete = false,
  emptyMessage,
  pageSize: pageSizeProp,
  initialPage = 1,
  serverPaged = false,
  total: totalProp,
  page: controlledPage,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [pageState, setPageState] = useState<number>(initialPage || 1);
  const [pageSize, setPageSize] = useState<number>(pageSizeProp || 10);

  useEffect(() => {
    try {
      const v = localStorage.getItem('stories.view');
      if (v === 'grid' || v === 'list') setView(v);
    } catch (e) {
      // ignore
    }
  }, []);

  const effectivePageSize = serverPaged ? (pageSizeProp || 10) : (pageSize || 10);

  useEffect(() => {
    const totalCount = serverPaged ? (totalProp || 0) : (stories?.length || 0);
    const maxPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));
    const current = controlledPage ?? pageState;
    const newPage = Math.max(1, Math.min(current, maxPages));
    if (controlledPage === undefined) setPageState(newPage);
  }, [serverPaged, totalProp, stories.length, effectivePageSize, controlledPage, pageState]);

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

  const total = serverPaged ? (totalProp || 0) : stories.length;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const currentPage = Math.min(Math.max(1, controlledPage ?? pageState), totalPages);
  const pagedStories = serverPaged ? stories : stories.slice((currentPage - 1) * effectivePageSize, (currentPage - 1) * effectivePageSize + effectivePageSize);

  return (
    <div>
      <StoriesToolbar
        count={serverPaged ? total : stories.length}
        view={view}
        onChangeView={(v) => setView(v)}
        page={currentPage}
        totalPages={totalPages}
        pageSize={effectivePageSize}
        onChangePage={(p) => {
          if (onPageChange) return onPageChange(p);
          setPageState(p);
        }}
        onChangePageSize={(s) => {
          if (onPageSizeChange) return onPageSizeChange(s);
          setPageSize(s);
          if (controlledPage === undefined) setPageState(1);
        }}
        total={total}
      />

      <StoryList stories={pagedStories} onDelete={onDelete} allowDelete={allowDelete} view={view} />
    </div>
  );
}
