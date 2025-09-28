'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import StoryList from '@/components/StoryList';
import type { Story } from '@/types/story';
import PageHeader from '@/components/Common/PageHeader';
import ContentCard from '@/components/Common/ContentCard';
import Hero from '@/components/Common/Hero';
import CategoriesSidebar from '@/components/Stories/CategoriesSidebar';

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/stories')
      .then(res => res.json())
      .then((data) => setStories(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return stories;
    const s = q.toLowerCase();
    return stories.filter(st => (st.title || '').toLowerCase().includes(s) || (st.description || '').toLowerCase().includes(s));
  }, [stories, q]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      const res = await fetch(`/api/stories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStories(stories.filter(story => story._id !== id));
      } else {
        alert('Failed to delete story');
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader title="Stories">
          <div className="flex items-center gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stories..."
              aria-label="Search stories"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </PageHeader>

        <div className="flex flex-1 min-h-0">
          <CategoriesSidebar />

          <div className="flex-1 p-6 overflow-y-auto">
            <Hero gradientClass="bg-gradient-to-r from-blue-50 to-white" borderClass="border-blue-100">
              <h2 className="text-2xl font-semibold text-gray-900">Discover stories created by the community</h2>
              <p className="text-sm text-gray-600 mt-2">Explore, read and get inspired. Create your own story and share it with others.</p>
            </Hero>
            <ContentCard>
              <div className="p-6">
                {loading ? (
                  <div className="text-gray-600">Loading stories…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-gray-600">No stories found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StoryList stories={filtered} onDelete={handleDelete} />
                  </div>
                )}
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </div>
  );
}