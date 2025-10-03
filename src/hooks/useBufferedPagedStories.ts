import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Story } from '@/types/story';

type UseBufferedOptions = {
  endpoint?: string; // full path like '/api/stories' or '/api/stories/mine'
  filters?: Record<string, string | number | undefined>;
  requestedPageSize?: number; // page size used by the UI (default 10)
  batchSize?: number; // server batch size (default 50, max 50)
  prefetchThreshold?: number; // pages before buffer end to trigger prefetch (default 1)
  initialPage?: number;
  // optional provider for dynamic headers (e.g. x-user-id)
  headersProvider?: () => Promise<Record<string, string>> | Record<string, string>;
};

type UseBufferedResult = {
  itemsForPage: Story[];
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  setPageSize: (s: number) => void;
  total: number;
  isLoading: boolean;
  isPrefetching: boolean;
  refresh: () => Promise<void>;
  unauthorized?: boolean;
};

export default function useBufferedPagedStories(opts: UseBufferedOptions = {}): UseBufferedResult {
  const {
    endpoint = '/api/stories',
    filters,
    requestedPageSize = 10,
    batchSize = 50,
    prefetchThreshold = 1,
    initialPage = 1,
  } = opts;

  const effectiveBatch = Math.min(50, Math.max(1, batchSize));
  const { headersProvider } = opts;

  const [unauthorized, setUnauthorized] = useState<boolean>(false);

  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(requestedPageSize);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPrefetching, setIsPrefetching] = useState<boolean>(false);

  // buffer: map skip -> items
  const bufferRef = useRef<Map<number, Story[]>>(new Map());
  const fetchedSkipsRef = useRef<Set<number>>(new Set());
  const abortRef = useRef<AbortController | null>(null);

  const buildUrl = useCallback((skip: number, limit: number) => {
    const url = new URL(endpoint, (typeof window !== 'undefined' && window.location.origin) || 'http://localhost');
    url.searchParams.set('skip', String(skip));
    url.searchParams.set('limit', String(limit));
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).length > 0) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }, [endpoint, filters]);

  const fetchBatch = useCallback(async (skip: number) => {
    if (fetchedSkipsRef.current.has(skip)) return; // already fetched
    fetchedSkipsRef.current.add(skip);
    if (abortRef.current) {
      // keep existing controller for prior requests; do not abort them unless reset
    }
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const url = buildUrl(skip, effectiveBatch);
      let headers: Record<string, string> | undefined = undefined;
      try {
        if (headersProvider) {
          const h = await headersProvider();
          headers = h;
        }
      } catch {
        // ignore header provider errors
      }
      const res = await fetch(url, { signal: controller.signal, headers });
      if (res.status === 401) {
        // mark unauthorized and do not throw — allow consumer to handle
        setUnauthorized(true);
        fetchedSkipsRef.current.delete(skip);
        return;
      }
      if (!res.ok) throw new Error('Fetch failed: ' + res.status);
      const json = await res.json();
      const items: Story[] = json.items || json;
      const t = typeof json.total === 'number' ? json.total : (items.length + skip);
      bufferRef.current.set(skip, items);
      setTotal(t);
    } catch (err) {
      // on error, allow retries by removing from fetched set
      fetchedSkipsRef.current.delete(skip);
      console.error('Error fetching batch', err);
    }
  }, [effectiveBatch, buildUrl, headersProvider]);

  const fetchInitial = useCallback(async () => {
    setIsLoading(true);
    bufferRef.current.clear();
    fetchedSkipsRef.current.clear();
    try {
      await fetchBatch(0);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBatch]);

  const refresh = useCallback(async () => {
    await fetchInitial();
  }, [fetchInitial]);

  // derive items for current page from buffer
  const itemsForPage = (() => {
    const startIndex = (page - 1) * pageSize;
    const batchIndex = Math.floor(startIndex / effectiveBatch);
    const batchSkip = batchIndex * effectiveBatch;
    const batch = bufferRef.current.get(batchSkip) || [];
    const withinBatchStart = startIndex - batchSkip;
    return batch.slice(withinBatchStart, withinBatchStart + pageSize);
  })();

  // trigger fetch when page requires a batch we don't have
  useEffect(() => {
    const startIndex = (page - 1) * pageSize;
    const batchIndex = Math.floor(startIndex / effectiveBatch);
    const skip = batchIndex * effectiveBatch;
    if (!bufferRef.current.has(skip)) {
      // fetch required batch
      (async () => {
        setIsLoading(true);
        await fetchBatch(skip);
        setIsLoading(false);
      })();
    }

    // prefetch next batch if we're close to the end of buffer
    const lastBufferedSkips = Array.from(bufferRef.current.keys()).sort((a, b) => a - b);
    if (lastBufferedSkips.length > 0) {
      const lastSkip = lastBufferedSkips[lastBufferedSkips.length - 1];
      // const lastBatchIndex = lastSkip / effectiveBatch;
      const lastBufferedPage = Math.floor(((lastSkip + (bufferRef.current.get(lastSkip)?.length || 0) - 1) / pageSize)) + 1;
      // const totalPages = Math.max(1, Math.ceil(total / pageSize));
      // if current page is within prefetchThreshold of lastBufferedPage, prefetch next batch
      if (lastBufferedPage - page <= prefetchThreshold) {
        const nextSkip = lastSkip + effectiveBatch;
        if (!fetchedSkipsRef.current.has(nextSkip) && (nextSkip < total)) {
          setIsPrefetching(true);
          fetchBatch(nextSkip).finally(() => setIsPrefetching(false));
        }
      }
    }
  }, [page, pageSize, effectiveBatch, fetchBatch, prefetchThreshold, total]);

  // extract complex dependency to avoid warning
  const filtersJson = useMemo(() => JSON.stringify(filters || {}), [filters]);

  // reset buffer when filters change
  useEffect(() => {
    (async () => {
      bufferRef.current.clear();
      fetchedSkipsRef.current.clear();
      setPage(1);
      await fetchInitial();
    })();
  }, [filtersJson, fetchInitial]);

  // ensure page stays in bounds when total/pageSize changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [total, pageSize, page]);

  return {
    itemsForPage,
    page,
    setPage,
    pageSize,
    setPageSize: (s: number) => {
      setPageSize(s);
      setPage(1);
    },
    total,
    isLoading,
    isPrefetching,
    refresh,
    unauthorized,
  };
}
