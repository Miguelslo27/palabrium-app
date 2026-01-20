"use client";

import React from 'react';

type Props = {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onChangePage: (page: number) => void;
  onChangePageSize: (size: number) => void;
};

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function StoriesPaginationControls({
  page,
  totalPages,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onChangePage,
  onChangePageSize,
}: Props) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <button
        type="button"
        onClick={() => onChangePage(Math.max(1, page - 1))}
        className="px-2 py-1 border rounded disabled:opacity-50"
        disabled={prevDisabled}
      >
        Prev
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        type="button"
        onClick={() => onChangePage(Math.min(totalPages, page + 1))}
        className="px-2 py-1 border rounded disabled:opacity-50"
        disabled={nextDisabled}
      >
        Next
      </button>

      <select
        value={pageSize}
        onChange={(event) => onChangePageSize(Number(event.target.value))}
        className="ml-2 px-2 py-1 border rounded bg-white text-sm"
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
