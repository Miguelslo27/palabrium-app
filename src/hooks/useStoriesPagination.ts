"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Story } from '@/types/story';

export interface StoriesPaginationOptions {
  items: Story[];
  serverPaged?: boolean;
  totalItems?: number;
  initialPage?: number;
  controlledPage?: number;
  pageSize?: number;
  defaultPageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface StoriesPaginationResult {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  items: Story[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

const DEFAULT_PAGE_SIZE = 10;

export function useStoriesPagination({
  items,
  serverPaged = false,
  totalItems,
  initialPage = 1,
  controlledPage,
  pageSize,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  onPageSizeChange,
}: StoriesPaginationOptions): StoriesPaginationResult {
  const [pageState, setPageState] = useState(initialPage);
  const [pageSizeState, setPageSizeState] = useState(pageSize ?? defaultPageSize);

  const effectivePageSize = serverPaged ? (pageSize ?? defaultPageSize) : pageSizeState;
  const total = serverPaged ? (totalItems ?? 0) : items.length;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const currentPage = useMemo(() => {
    const sourcePage = controlledPage ?? pageState;
    return Math.min(Math.max(1, sourcePage), totalPages);
  }, [controlledPage, pageState, totalPages]);

  useEffect(() => {
    const desired = controlledPage ?? pageState;
    const adjusted = Math.min(Math.max(1, desired), totalPages);
    if (controlledPage === undefined && adjusted !== pageState) {
      setPageState(adjusted);
    }
  }, [controlledPage, pageState, totalPages]);

  const pagedItems = useMemo(() => {
    if (serverPaged) {
      return items;
    }
    const offset = (currentPage - 1) * effectivePageSize;
    return items.slice(offset, offset + effectivePageSize);
  }, [serverPaged, items, currentPage, effectivePageSize]);

  const setPage = useCallback(
    (page: number) => {
      if (onPageChange) {
        onPageChange(page);
      } else {
        setPageState(Math.min(Math.max(1, page), Math.max(1, totalPages)));
      }
    },
    [onPageChange, totalPages],
  );

  const setPageSize = useCallback(
    (size: number) => {
      if (onPageSizeChange) {
        onPageSizeChange(size);
      }

      if (!serverPaged) {
        setPageSizeState(size);
        if (controlledPage === undefined) {
          setPageState(1);
        }
      }
    },
    [controlledPage, onPageSizeChange, serverPaged],
  );

  return {
    page: currentPage,
    totalPages,
    totalItems: total,
    pageSize: effectivePageSize,
    items: pagedItems,
    setPage,
    setPageSize,
  };
}
