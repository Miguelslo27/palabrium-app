"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorForm from '@/components/Editor/EditorForm';
import EditorHeader from '@/components/Editor/EditorHeader';
import Sidebar from '@/components/Editor/Sidebar';
import Chapters from '@/components/Editor/Chapters';
import Button from '@/components/Editor/Shared/Button';
import { fetchChapters, createChapter, updateChapter, deleteChapter } from '@/lib/useChapters';
import getClerkClient from '@/lib/clerk-client';

type Props = { storyId: string };

export default function EditStoryClient({ storyId }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [origStory, setOrigStory] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!storyId) return;
    let mounted = true;
    async function load() {
      try {
        const sres = await fetch(`/api/stories/${storyId}`);
        if (!sres.ok) throw new Error('Story not found');
        const sdata = await sres.json();
        if (!mounted) return;
        setTitle(sdata.title || '');
        setOrigStory(sdata || null);
        setDescription(sdata.description || '');
        const ch = await fetchChapters(storyId);
        if (!mounted) return;
        setChapters(ch);
        setExpandedIndex(ch.length > 0 ? 0 : null);
      } catch (err) {
        console.error('load', err);
      }
    }
    load();
    return () => { mounted = false };
  }, [storyId]);

  const addChapter = () => {
    const newChapters = [...chapters, { title: '', content: '' }];
    setChapters(newChapters);
    setExpandedIndex(newChapters.length - 1);
  };

  const removeChapter = (index: number) => {
    if (chapters.length === 1) return;
    const newChapters = chapters.filter((_, i) => i !== index);
    setChapters(newChapters);
    if (expandedIndex === null) return;
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex! > index) setExpandedIndex(expandedIndex! - 1);
  };

  const updateChapterLocal = (index: number, field: string, value: string) => {
    const newChapters = [...chapters];
    newChapters[index] = { ...newChapters[index], [field]: value };
    setChapters(newChapters);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      // Try to get the user id from Clerk first, fallback to any injected __USER_ID__ for dev
      let userId: string | null = null;
      try {
        const clerk: any = getClerkClient();
        await clerk.load();
        userId = clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
      } catch (err) {
        // ignore — we'll fallback to window.__USER_ID__ below
      }
      if (!userId && typeof window !== 'undefined') {
        userId = (window as any).__USER_ID__ || null;
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-user-id'] = String(userId);
      // Update metadata only if changed
      if (!origStory || origStory.title !== title || origStory.description !== description) {
        const metaRes = await fetch(`/api/stories/${storyId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ title, description }),
        });
        if (!metaRes.ok) throw new Error('Failed updating story');
      }

      const existing = await fetchChapters(storyId);
      const currentIds = new Set(chapters.filter(c => c._id).map(c => String(c._id)));

      for (const c of existing) {
        if (!currentIds.has(String(c._id))) {
          await deleteChapter(String(c._id));
        }
      }

      // Update or create chapters only when their content changed. Also set order.
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const order = i;
        if (ch._id) {
          const old = existing.find((e: any) => String(e._id) === String(ch._id));
          const changed = !old || old.title !== ch.title || old.content !== ch.content || Boolean(old.published) !== Boolean(ch.published) || Number(old.order || 0) !== order;
          if (changed) {
            await updateChapter(ch._id, { title: ch.title, content: ch.content, order, published: Boolean(ch.published) });
          }
        } else {
          const created = await createChapter(storyId, { title: ch.title, content: ch.content, order, published: Boolean(ch.published) });
          setChapters((arr) => arr.map((a) => (a === ch ? created : a)));
        }
      }

      router.push(`/story/${storyId}`);
    } catch (err) {
      console.error('save', err);
      alert('Error saving story');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <EditorForm onSubmit={handleSubmit}>
      <EditorHeader title="Edit story">
        <Button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) router.back();
            else router.push('/');
          }}
          className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded text-sm"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting} className="bg-blue-700 disabled:opacity-60 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm shadow">
          {submitting ? 'Saving…' : 'Guardar'}
        </Button>
      </EditorHeader>

      <div className="flex-1 flex overflow-auto min-h-0">
        <Sidebar title={title} description={description} setTitle={setTitle} setDescription={setDescription} />

        <Chapters
          chapters={chapters}
          expandedIndex={expandedIndex}
          setExpandedIndex={setExpandedIndex}
          addChapter={addChapter}
          removeChapter={removeChapter}
          updateChapter={updateChapterLocal}
        />
      </div>
    </EditorForm>
  );
}
