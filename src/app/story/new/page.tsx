'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
    if (process.env.NODE_ENV !== 'production') console.log('Submitting form');
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    if (!description.trim()) {
      alert('Description is required');
      return;
    }
    if (chapters.length === 0 || chapters.every(ch => !ch.content.trim())) {
      alert('At least one chapter with content is required');
      return;
    }
    const response = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, chapters }),
    });
    if (process.env.NODE_ENV !== 'production') console.log('Response:', response.ok);
    if (response.ok) {
      const data = await response.json();
      if (process.env.NODE_ENV !== 'production') console.log('Data:', data);
      router.push(`/story/${data.id}`);
    } else {
      alert('Error creating story');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <form onSubmit={handleSubmit} className="h-full">
            <div className="grid grid-cols-[1fr_3fr] gap-8 h-full">
              <div className="space-y-6 p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Create New Story</h1>
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-32"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-6 h-full overflow-y-auto p-8">
                <h2 className="text-xl font-semibold text-gray-900">Chapters</h2>
                {chapters.map((chapter, index) => (
                  <div key={index} className="space-y-4 p-4 border-2 border-gray-300 rounded-lg">
                    <div>
                      <label className="block text-lg font-medium text-gray-900 mb-2">Chapter Title</label>
                      <input
                        type="text"
                        placeholder="Chapter Title"
                        value={chapter.title}
                        onChange={(e) => updateChapter(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-900 mb-2">Chapter Content</label>
                      <textarea
                        placeholder="Chapter Content"
                        value={chapter.content}
                        onChange={(e) => updateChapter(index, 'content', e.target.value)}
                        className="w-full px-4 py-3 text-lg text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 h-64 placeholder:text-gray-700"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
        <div className="bg-gray-100 p-4 border-t border-gray-300">
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={addChapter} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition">
              Add New Chapter
            </button>
            <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition">
              Save Story
            </button>
            <Link href="/">
              <button type="button" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg text-lg transition">
                Cancel
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}