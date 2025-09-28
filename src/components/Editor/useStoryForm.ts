"use client";

import { useEffect, useState } from 'react';
import getClerkClient from '@/lib/clerk-client';
import { fetchChapters, createChapter, updateChapter, deleteChapter } from '@/lib/useChapters';

type UseStoryFormOpts = {
  mode?: 'create' | 'edit';
  storyId?: string;
};

export default function useStoryForm({ mode = 'create', storyId }: UseStoryFormOpts) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [origStory, setOrigStory] = useState<any | null>(null);
  const [chapters, setChapters] = useState<any[]>(mode === 'create' ? [{ title: '', content: '' }] : []);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== 'edit' || !storyId) return;
    let mounted = true;
    async function load() {
      try {
        const sres = await fetch(`/api/stories/${storyId}`);
        if (!sres.ok) throw new Error('Story not found');
        const sdata = await sres.json();
        if (!mounted) return;
        setTitle(sdata.title || '');
        setDescription(sdata.description || '');
        setOrigStory(sdata || null);
        const ch = await fetchChapters(storyId!);
        if (!mounted) return;
        setChapters(ch);
        setExpandedIndex(ch.length > 0 ? 0 : null);
      } catch (err) {
        console.error('load', err);
      }
    }
    load();
    return () => { mounted = false };
  }, [mode, storyId]);

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

  async function detectUserId(): Promise<string | null> {
    try {
      const clerk: any = getClerkClient();
      await clerk.load();
      return clerk?.user?.id || (clerk?.client && clerk.client.user && clerk.client.user.id) || null;
    } catch (err) {
      if (typeof window !== 'undefined') return (window as any).__USER_ID__ || null;
      return null;
    }
  }

  async function create(payload: { title: string; description: string; chapters: any[] }) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const userId = await detectUserId();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (userId) headers['x-user-id'] = String(userId);

      const res = await fetch('/api/stories', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed creating story');
      const data = await res.json();
      return data;
    } finally {
      setSubmitting(false);
    }
  }

  async function edit() {
    if (submitting) return;
    if (!storyId) throw new Error('Missing story id');
    setSubmitting(true);
    try {
      const userId = await detectUserId();
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

      return { ok: true };
    } finally {
      setSubmitting(false);
    }
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    origStory,
    chapters,
    setChapters,
    expandedIndex,
    setExpandedIndex,
    submitting,
    addChapter,
    removeChapter,
    updateChapterLocal,
    create,
    edit,
  };
}
