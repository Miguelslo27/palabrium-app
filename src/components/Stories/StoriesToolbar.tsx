"use client";
import React from 'react';
import StoryViewToggle from '@/components/Story/StoryViewToggle';
import StoriesPaginationSummary from '@/components/Stories/StoriesPaginationSummary';
import StoriesPaginationControls from '@/components/Stories/StoriesPaginationControls';

type Props = {
  count: number;
  view: 'grid' | 'list';
  onChangeView: (v: 'grid' | 'list') => void;
  // pagination
  page?: number;
  totalPages?: number;
  pageSize?: number;
  total?: number;
  onChangePage?: (p: number) => void;
  onChangePageSize?: (s: number) => void;
};

export default function StoriesToolbar({
  count,
  view,
  onChangeView,
  page,
  totalPages,
  pageSize,
  onChangePage,
  onChangePageSize,
  total,
}: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-gray-600">
        <StoriesPaginationSummary
          page={page}
          pageSize={pageSize}
          total={total}
          count={count}
        />
      </div>
      <div className="flex items-center gap-4">
        <StoryViewToggle view={view} onChange={onChangeView} />

        {typeof page !== 'undefined' && typeof totalPages !== 'undefined' && typeof onChangePage === 'function' && typeof onChangePageSize === 'function' ? (
          <StoriesPaginationControls
            page={page || 1}
            totalPages={totalPages || 1}
            pageSize={pageSize || 10}
            onChangePage={onChangePage}
            onChangePageSize={onChangePageSize}
          />
        ) : null}
      </div>
    </div>
  );
}
