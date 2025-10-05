import { useCallback, useEffect, useState } from 'react';
import type { Story } from '@/types/story';
import { useUser } from '@/contexts/UserContext';

type UseMyStories = {
  stories: Story[];
  loading: boolean;
  unauthorized: boolean;
  refresh: () => Promise<void>;
  deleteStory: (id: string) => Promise<boolean>;
  deleteAll: () => Promise<boolean>;
};

export default function useMyStories(): UseMyStories {
  const { userId, loading: userLoading } = useUser();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const fetchStories = useCallback(async () => {
    // Don't fetch until we know if user is authenticated
    if (userLoading) {
      return;
    }

    setLoading(true);
    setUnauthorized(false);
    
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
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userLoading]);

  const deleteStory = useCallback(async (id: string) => {
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
    } catch {
      return false;
    }
  }, [userId]);

  const deleteAll = useCallback(async () => {
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
    } catch {
      return false;
    }
  }, [userId]);

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
