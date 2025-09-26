"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import getClerkClient from '../../../lib/clerk-client';
import EditorLayout from '@/components/Editor/EditorLayout';
import EditorHeader from '@/components/Editor/EditorHeader';
import Sidebar from '@/components/Editor/Sidebar';
import Chapters from '@/components/Editor/Chapters';

export default function CreateStory() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chapters, setChapters] = useState([{ title: '', content: '' }]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const addChapter = () => {
    const newChapters = [...chapters, { title: '', content: '' }];
    setChapters(newChapters);
    setExpandedIndex(newChapters.length - 1);
  };

  const removeChapter = (index: number) => {
    if (chapters.length === 1) return; // prevent removing last chapter
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters);
    // adjust expandedIndex: if removed chapter was before or equal to expanded, shift or close
    if (expandedIndex === null) return;
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else if (expandedIndex! > index) {
      setExpandedIndex(expandedIndex! - 1);
    }
  };

  const updateChapter = (index: number, field: string, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
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
    setSubmitting(false);
  };

  return (
    <EditorLayout>
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <EditorHeader title="Create story">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/');
                }
              }}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded text-sm"
            >
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="bg-blue-700 disabled:opacity-60 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm shadow">
              {submitting ? 'Saving…' : 'Guardar'}
            </button>
          </EditorHeader>
          <div className="flex-1 flex overflow-auto min-h-0">
            <Sidebar title={title} description={description} setTitle={setTitle} setDescription={setDescription} />

            <Chapters
              chapters={chapters}
              expandedIndex={expandedIndex}
              setExpandedIndex={setExpandedIndex}
              addChapter={addChapter}
              removeChapter={removeChapter}
              updateChapter={updateChapter}
            />
          </div>
        </form>
      </div>
    </EditorLayout>
  );
}