import { useCallback, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import useBufferedPagedStories from '@/hooks/useBufferedPagedStories';

export default function useMyStoriesPaged(opts: { requestedPageSize?: number } = {}) {
  const { requestedPageSize = 10 } = opts;
  const { userId, loading: userLoading } = useUser();

  // Provide headersProvider so the hook can send x-user-id to the protected endpoint
  const hook = useBufferedPagedStories({
    endpoint: '/api/stories/mine', // Always set the endpoint to avoid re-renders
    requestedPageSize,
    batchSize: 50,
    prefetchThreshold: 1,
    headersProvider: useCallback(async () => {
      // Don't provide headers if user is still loading - throw to prevent fetch
      if (userLoading) {
        throw new Error('User is still loading');
      }
      if (userId) return { 'x-user-id': String(userId) } as Record<string, string>;
      return {} as Record<string, string>;
    }, [userId, userLoading]),
  });

  // If user is loading, show loading state
  // If user is not authenticated (after loading), show unauthorized
  const isUnauthorized = !userLoading && !userId;

  // When user finishes loading, refresh to retry the fetch
  const hasUserLoadedRef = useRef(false);
  useEffect(() => {
    if (!userLoading && !hasUserLoadedRef.current) {
      hasUserLoadedRef.current = true;
      hook.refresh();
    }
  }, [userLoading, hook.refresh]);

  return {
    stories: hook.itemsForPage,
    loading: userLoading || hook.isLoading,
    unauthorized: isUnauthorized,
    refresh: hook.refresh,
    deleteStory: async (id: string) => {
      if (!userId) {
        alert('You must be signed in to delete a story');
        return false;
      }
      try {
        const res = await fetch(`/api/stories/${id}`, { method: 'DELETE', headers: { 'x-user-id': String(userId) } });
        if (res.ok) {
          await hook.refresh();
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    deleteAll: async () => {
      if (!userId) {
        alert('You must be signed in to perform this action');
        return false;
      }
      try {
        const res = await fetch('/api/stories/mine', { method: 'DELETE', headers: { 'x-user-id': String(userId) } });
        if (res.ok) {
          await hook.refresh();
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    // expose pagination helpers too if needed
    page: hook.page,
    setPage: hook.setPage,
    pageSize: hook.pageSize,
    setPageSize: hook.setPageSize,
    total: hook.total,
    isPrefetching: hook.isPrefetching,
  };
}
