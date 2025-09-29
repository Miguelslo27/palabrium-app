"use client";

import React from 'react';
import StoryViewToggle from '@/components/Story/StoryViewToggle';

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
        {typeof page !== 'undefined' && typeof total === 'number' ? (
          (() => {
            const start = (page - 1) * (pageSize || 10) + 1;
            const end = Math.min(total, (page - 1) * (pageSize || 10) + (pageSize || 10));
            return <>Showing {start}-{end} of {total}</>;
          })()
        ) : (
          <>Showing {count} stories</>
        )}
      </div>
      <div className="flex items-center gap-4">
        <StoryViewToggle view={view} onChange={onChangeView} />

        {typeof page !== 'undefined' ? (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button
              onClick={() => onChangePage && onChangePage(Math.max(1, (page || 1) - 1))}
              className="px-2 py-1 border rounded disabled:opacity-50"
              disabled={!(page && page > 1)}
            >Prev</button>
            <span>Page {page || 1} of {totalPages || 1}</span>
            <button
              onClick={() => onChangePage && onChangePage(Math.min(totalPages || 1, (page || 1) + 1))}
              className="px-2 py-1 border rounded"
              disabled={!(page && page < (totalPages || 1))}
            >Next</button>

            <select
              value={pageSize || 10}
              onChange={(e) => onChangePageSize && onChangePageSize(Number(e.target.value))}
              className="ml-2 px-2 py-1 border rounded bg-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}
