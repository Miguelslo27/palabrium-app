"use client";

import React from 'react';
import StoriesToolbar from '@/components/Stories/StoriesToolbar';
import StoryList from '@/components/Story/StoryList';
import type { Story } from '@/types/story';
import { useStoriesPagination } from '@/hooks/useStoriesPagination';
import { useStoriesViewPreference } from '@/hooks/useStoriesViewPreference';

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
  showYoursBadge?: boolean;
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
  showYoursBadge = true,
}: Props) {
  const [view, setView] = useStoriesViewPreference();
  const pagination = useStoriesPagination({
    items: stories,
    serverPaged,
    totalItems: totalProp,
    initialPage,
    controlledPage,
    pageSize: pageSizeProp,
    onPageChange,
    onPageSizeChange,
  });

  if (loading) return <div className="text-gray-600">Loading stories…</div>;
  if (unauthorized) return <div className="text-red-600">You must be signed in to see your stories.</div>;
  if (!stories || stories.length === 0) return <div className="text-gray-600">{emptyMessage ?? 'No stories found.'}</div>;

  return (
    <div>
      <StoriesToolbar
        count={pagination.totalItems}
        view={view}
        onChangeView={setView}
        page={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        onChangePage={pagination.setPage}
        onChangePageSize={pagination.setPageSize}
        total={pagination.totalItems}
      />

      <StoryList stories={pagination.items} onDelete={onDelete} allowDelete={allowDelete} view={view} showYoursBadge={showYoursBadge} />
    </div>
  );
}
