'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import StoryList from '@/components/StoryList';

interface Story {
  _id: string;
  title: string;
  description: string;
  authorId: string;
}

export default function Stories() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    fetch('/api/stories')
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
        <h1 className="text-3xl font-bold mb-6">Stories</h1>
        <StoryList stories={stories} onDelete={handleDelete} showDeleteForOwned={true} />
      </div>
    </div>
  );
}