'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

interface Story {
  _id: string;
  title: string;
  description: string;
}

export default function MyStories() {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    fetch('/api/my-stories')
      .then(res => res.json())
      .then(setStories);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">My Stories</h1>
        <Link href="/story/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">
          Create New Story
        </Link>
        <div className="grid gap-4">
          {stories.map((story) => (
            <div key={story._id} className="p-4 border rounded hover:shadow">
              <h2 className="text-xl font-semibold">
                <Link href={`/story/${story._id}`} className="text-blue-600 hover:underline">
                  {story.title}
                </Link>
              </h2>
              <p className="text-gray-600">{story.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}