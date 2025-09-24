'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CreateStory() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState([{ title: '', content: '' }]);
  const router = useRouter();

  const addChapter = () => {
    setChapters([...chapters, { title: '', content: '' }]);
  };

  const updateChapter = (index: number, field: string, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, chapters }),
    });
    if (response.ok) {
      const { id } = await response.json();
      router.push(`/story/${id}`);
    } else {
      alert('Error creating story');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Story</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Chapters</h2>
            {chapters.map((chapter, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <input
                  type="text"
                  placeholder="Chapter Title"
                  value={chapter.title}
                  onChange={(e) => updateChapter(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <textarea
                  placeholder="Chapter Content"
                  value={chapter.content}
                  onChange={(e) => updateChapter(index, 'content', e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={5}
                />
              </div>
            ))}
            <button type="button" onClick={addChapter} className="bg-gray-500 text-white px-4 py-2 rounded">
              Add Chapter
            </button>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Story
          </button>
        </form>
      </div>
    </div>
  );
}