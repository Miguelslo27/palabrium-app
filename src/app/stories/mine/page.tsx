'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StoryList from '@/components/StoryList';
import type { Story } from '@/types/story';
import getClerkClient from '../../../lib/clerk-client';

export default function MyStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      let userId: string | null = null;
      try {
        const clerk: any = getClerkClient();
        // some builds expose load, some don't — defensive
        if (typeof clerk.load === 'function') await clerk.load();
        userId = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
      } catch (e) {
        // ignore
      }
      if (!userId && typeof window !== 'undefined') {
        userId = (window as any).__USER_ID__ || null;
      }

      if (!userId) {
        // no client user id available — API expects x-user-id
        if (mounted) {
          setUnauthorized(true);
          setStories([]);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/stories/mine', { headers: { 'x-user-id': String(userId) } });
        if (!res.ok) {
          if (mounted) setStories([]);
        } else {
          const data = await res.json();
          if (mounted) setStories(data);
        }
      } catch (e) {
        if (mounted) setStories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;

    let userId: string | null = null;
    try {
      const clerk: any = getClerkClient();
      if (typeof clerk.load === 'function') await clerk.load();
      userId = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
    } catch (e) {
      // ignore
    }
    if (!userId && typeof window !== 'undefined') userId = (window as any).__USER_ID__ || null;
    if (!userId) {
      alert('You must be signed in to delete a story');
      return;
    }

    const res = await fetch(`/api/stories/${id}`, { method: 'DELETE', headers: { 'x-user-id': String(userId) } });
    if (res.ok) {
      setStories(stories.filter(story => story._id !== id));
    } else {
      alert('Failed to delete story');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 bg-gray-200/70 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Stories</h1>
          <div className="flex items-center gap-3">
            <Link href="/story/new">
              <button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm">
                Create New Story
              </button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex overflow-auto min-h-0">
          <aside className="w-72 h-full bg-gray-50 p-6 border-r border-gray-300 flex flex-col overflow-y-auto">
            <div className="mb-4">
              <span className="text-sm font-semibold text-gray-700 uppercase">Your books</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-800 mb-2">Stories</label>
              <div className="text-lg font-bold text-gray-900">{stories.length}</div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-2">Actions</label>
              <div className="flex flex-col gap-2">
                <Link href="/story/new" className="text-sm bg-white border border-gray-300 px-3 py-2 rounded text-gray-800 text-center">Create story</Link>
                <button
                  onClick={async () => {
                    if (!confirm('Delete ALL your stories? This cannot be undone.')) return;
                    let userId: string | null = null;
                    try {
                      const clerk: any = getClerkClient();
                      if (typeof clerk.load === 'function') await clerk.load();
                      userId = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
                    } catch (e) {
                      // ignore
                    }
                    if (!userId && typeof window !== 'undefined') userId = (window as any).__USER_ID__ || null;
                    if (!userId) {
                      alert('You must be signed in to perform this action');
                      return;
                    }
                    const res = await fetch('/api/stories/mine', { method: 'DELETE', headers: { 'x-user-id': String(userId) } });
                    if (res.ok) {
                      setStories([]);
                      alert('Deleted all stories');
                    } else {
                      alert('Failed to delete stories');
                    }
                  }}
                  className="text-sm bg-white border border-gray-300 px-3 py-2 rounded text-gray-800 text-center"
                >
                  Clear list (dev)
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="bg-white border border-gray-300 rounded shadow-sm h-full flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-gray-600">Loading your stories…</div>
                ) : unauthorized ? (
                  <div className="text-red-600">You must be signed in to see your stories.</div>
                ) : stories.length === 0 ? (
                  <div className="text-gray-600">You have no stories yet. <Link href="/story/new" className="text-blue-600">Create one</Link>.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StoryList stories={stories} onDelete={handleDelete} />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}