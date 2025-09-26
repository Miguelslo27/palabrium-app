'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import getClerkClient from '../../../lib/clerk-client';

export default function CreateStory() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState([{ title: '', content: '' }]);
  const router = useRouter();

  const addChapter = () => {
    setChapters([...chapters, { title: '', content: '' }]);
  };

  const removeChapter = (index: number) => {
    if (chapters.length === 1) return; // prevent removing last chapter
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters);
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
    // Attempt to include a user id header required by the API
    let userId: string | null = null;
    try {
      const clerk: any = getClerkClient();
      await clerk.load();
      // Different builds may expose user at clerk.user or clerk.client.user
      userId = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
    } catch (e) {
      // ignore — we'll fallback to any injected __USER_ID__ if present
    }
    if (!userId && typeof window !== 'undefined') {
      userId = (window as any).__USER_ID__ || null;
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (userId) headers['x-user-id'] = String(userId);

    const response = await fetch('/api/stories', {
      method: 'POST',
      headers,
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
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 bg-gray-200/70 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Create story</h1>
            <div className="flex items-center gap-3">
              <Link href="/">
                <button type="button" className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded text-sm">
                  Cancelar
                </button>
              </Link>
              <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm shadow">
                Guardar
              </button>
            </div>
          </div>
          <div className="flex-1 flex overflow-auto min-h-0">
            <aside className="w-72 h-full bg-gray-50 p-6 border-r border-gray-300 flex flex-col overflow-y-auto">
              <div className="mb-4">
                <span className="text-sm font-semibold text-gray-700 uppercase">Your book</span>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-800 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-800 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 h-40 resize-none"
                  required
                />
              </div>
            </aside>

            {/* Right main: chapters panel */}
            <main className="flex-1 p-6 overflow-y-auto">
              <div className="bg-white border border-gray-300 rounded shadow-sm h-full flex flex-col">
                <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Chapters ({chapters.length})</h2>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  {chapters.map((chapter, index) => (
                    <section key={index} className="bg-gray-50 p-4 border border-gray-300 rounded">
                      <div className="mb-3 flex-1 flex flex-col">
                        <label className="block text-sm font-medium text-gray-800 mb-1">Title</label>
                        <div className="flex flex-row">
                          <input
                            type="text"
                            placeholder=""
                            value={chapter.title}
                            onChange={(e) => updateChapter(index, 'title', e.target.value)}
                            className="w-full h-10 px-3 mr-3 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeChapter(index)}
                            disabled={chapters.length === 1}
                            aria-label="Remove chapter"
                            title="Remove chapter"
                            className="h-10 w-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">Contenido</label>
                        <textarea
                          placeholder=""
                          value={chapter.content}
                          onChange={(e) => updateChapter(index, 'content', e.target.value)}
                          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-48 resize-vertical"
                          required
                        />
                      </div>
                    </section>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-gray-300 bg-gray-50 flex items-center justify-between">
                  <button type="button" onClick={addChapter} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-800 border border-gray-400 rounded shadow-sm">
                    <span className="text-xl font-bold">+</span>
                    <span>Agregar capítulo</span>
                  </button>
                  <div />
                </div>
              </div>
            </main>
          </div>
        </form>
      </div>
    </div>
  );
}