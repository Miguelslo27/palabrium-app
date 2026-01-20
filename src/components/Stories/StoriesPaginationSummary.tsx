"use client";

import React, { useMemo } from 'react';

type Props = {
  page?: number;
  pageSize?: number;
  total?: number;
  count?: number;
};

function calculateRange(page = 1, pageSize = 10, total = 0) {
  if (total === 0) {
    return { start: 0, end: 0 };
  }

  const start = Math.min((page - 1) * pageSize + 1, total);
  const end = Math.min(start + pageSize - 1, total);

  return { start, end };
}

export default function StoriesPaginationSummary({ page, pageSize, total, count }: Props) {
  const resolvedPageSize = pageSize ?? 10;
  const resolvedTotal = total ?? count ?? 0;

  const { start, end } = useMemo(
    () => calculateRange(page, resolvedPageSize, resolvedTotal),
    [page, resolvedPageSize, resolvedTotal],
  );

  if (typeof page === 'undefined' || typeof total === 'undefined') {
    return <>{`Showing ${count ?? resolvedTotal} stories`}</>;
  }

  return <>Showing {start}-{end} of {resolvedTotal}</>;
}

export { calculateRange as calculateStoriesPaginationRange };
