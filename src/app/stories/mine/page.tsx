'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StoryList from '@/components/StoryList';
import type { Story } from '@/types/story';

export default function MyStories() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    fetch('/api/stories/mine')
      .then(res => res.json())
      .then(setStories);
  }, []);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">My Stories</h1>
        <Link href="/story/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
          Create New Story
        </Link>
        <StoryList stories={stories} onDelete={handleDelete} />
      </div>
    </div>
  );
}