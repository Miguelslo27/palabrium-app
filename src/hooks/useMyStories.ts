import { useCallback, useEffect, useState } from 'react';
import type { Story } from '@/types/story';
import getClientUserId from '@/lib/getClientUserId';

type UseMyStories = {
  stories: Story[];
  loading: boolean;
  unauthorized: boolean;
  refresh: () => Promise<void>;
  deleteStory: (id: string) => Promise<boolean>;
  deleteAll: () => Promise<boolean>;
};

// use shared helper getClientUserId

export default function useMyStories(): UseMyStories {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    setUnauthorized(false);
    const userId = await getClientUserId();
    if (!userId) {
      setStories([]);
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/stories/mine', { headers: { 'x-user-id': String(userId) } });
      if (!res.ok) {
        setStories([]);
      } else {
        const data = await res.json();
        setStories(data);
      }
    } catch (e) {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStory = useCallback(async (id: string) => {
    const userId = await getClientUserId();
    if (!userId) {
      alert('You must be signed in to delete a story');
      return false;
    }
    try {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE', headers: { 'x-user-id': String(userId) } });
      if (res.ok) {
        setStories(prev => prev.filter(s => s._id !== id));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  const deleteAll = useCallback(async () => {
    const userId = await getClientUserId();
    if (!userId) {
      alert('You must be signed in to perform this action');
      return false;
    }
    try {
      const res = await fetch('/api/stories/mine', { method: 'DELETE', headers: { 'x-user-id': String(userId) } });
      if (res.ok) {
        setStories([]);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await fetchStories();
      if (!mounted) return;
    })();
    return () => { mounted = false; };
  }, [fetchStories]);

  return { stories, loading, unauthorized, refresh: fetchStories, deleteStory, deleteAll };
}
