"use client";

import { useEffect, useState, useCallback } from 'react';

interface Story {
  _id?: string;
  title?: string;
  description?: string;
  published?: boolean;
  publishedAt?: string | null;
  unPublishedAt?: string | null;
  publishedBy?: string | null;
  unPublishedBy?: string | null;
}

interface Chapter {
  _id?: string;
  title: string;
  content: string;
  order?: number;
  published?: boolean;
  publishedAt?: string | null;
  unPublishedAt?: string | null;
  publishedBy?: string | null;
  unPublishedBy?: string | null;
}

type UseStoryFormOpts = {
  mode?: 'create' | 'edit';
  storyId?: string;
};

export default function useStoryForm({ mode = 'create', storyId }: UseStoryFormOpts) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [origStory, setOrigStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(mode === 'create' ? [{ title: '', content: '' }] : []);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [submitting, setSubmitting] = useState(false);

  const loadStoryAndChapters = useCallback(async () => {
    if (mode !== 'edit' || !storyId) return;
    try {
      const { getStoryWithChaptersAction, getChaptersAction } = await import('@/app/actions');

      const sdata = await getStoryWithChaptersAction(storyId);
      if (!sdata) throw new Error('Story not found');

      setTitle(sdata.title || '');
      setDescription(sdata.description || '');
      setOrigStory(sdata);

      const ch = await getChaptersAction(storyId);
      // Convert ChapterData[] to Chapter[]
      const chapters: Chapter[] = ch.map(c => ({
        _id: c._id.toString(),
        title: c.title,
        content: c.content,
        order: c.order,
        published: c.published,
        publishedAt: c.publishedAt ? c.publishedAt.toISOString() : null,
        unPublishedAt: c.unPublishedAt ? c.unPublishedAt.toISOString() : null,
        publishedBy: c.publishedBy || null,
        unPublishedBy: c.unPublishedBy || null
      }));
      setChapters(chapters);
      setExpandedIndex(chapters.length > 0 ? 0 : null);
    } catch (err) {
      console.error('load', err);
    }
  }, [mode, storyId]);

  useEffect(() => {
    let mounted = true;
    if (mode !== 'edit' || !storyId) return;
    (async () => {
      if (!mounted) return;
      await loadStoryAndChapters();
    })();
    return () => { mounted = false };
  }, [loadStoryAndChapters, mode, storyId]);

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

  type PublishedPayload =
    | boolean
    | {
      published: boolean;
      publishedAt?: string | null;
      publishedBy?: string | null;
      unPublishedAt?: string | null;
      unPublishedBy?: string | null;
    };
  const setChapterPublished = (index: number, payload: PublishedPayload) => {
    const newChapters = [...chapters];
    if (!newChapters[index]) return;
    if (typeof payload === 'boolean') {
      newChapters[index] = { ...newChapters[index], published: Boolean(payload) };
    } else {
      newChapters[index] = {
        ...newChapters[index],
        published: Boolean(payload.published),
        publishedAt: payload.publishedAt ?? newChapters[index].publishedAt ?? null,
        unPublishedAt: payload.unPublishedAt ?? newChapters[index].unPublishedAt ?? null,
        publishedBy: payload.publishedBy ?? newChapters[index].publishedBy ?? null,
        unPublishedBy: payload.unPublishedBy ?? newChapters[index].unPublishedBy ?? null,
      };
    }
    setChapters(newChapters);
  };

  async function create(payload: { title: string; description: string; chapters: Chapter[] }) {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Import the Server Action dynamically
      const { createStoryAction } = await import('@/app/actions');

      // Create the story first
      const story = await createStoryAction({
        title: payload.title,
        description: payload.description,
      });

      // Then create all chapters
      const { createChapterAction, updateChapterAction } = await import('@/app/actions');
      for (const chapter of payload.chapters) {
        const created = await createChapterAction({
          storyId: story._id,
          title: chapter.title,
          content: chapter.content,
          order: chapter.order || 0,
        });
        // If chapter should be published, update it
        if (chapter.published) {
          await updateChapterAction(created._id.toString(), { published: true });
        }
      }

      return { id: story._id, ...story };
    } finally {
      setSubmitting(false);
    }
  }

  async function edit() {
    if (submitting) return;
    if (!storyId) throw new Error('Missing story id');
    setSubmitting(true);
    try {
      // Import Server Actions
      const { updateStoryAction, createChapterAction, updateChapterAction, deleteChapterAction, getChaptersAction } = await import('@/app/actions');

      // Update metadata only if changed
      if (!origStory || origStory.title !== title || origStory.description !== description) {
        await updateStoryAction(storyId, { title, description });
      }

      const existing = await getChaptersAction(storyId);
      const currentIds = new Set(chapters.filter(c => c._id).map(c => String(c._id)));

      // Delete removed chapters
      for (const c of existing) {
        if (!currentIds.has(String(c._id))) {
          await deleteChapterAction(String(c._id), storyId);
        }
      }

      // Update or create chapters
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        const order = i;
        if (ch._id) {
          const old = existing.find((e) => String(e._id) === String(ch._id));
          const changed = !old || old.title !== ch.title || old.content !== ch.content || Boolean(old.published) !== Boolean(ch.published) || Number(old.order || 0) !== order;
          if (changed) {
            await updateChapterAction(ch._id, { title: ch.title, content: ch.content, order, published: Boolean(ch.published) });
          }
        } else {
          const created = await createChapterAction({
            storyId,
            title: ch.title,
            content: ch.content,
            order
          });
          // Update the chapter with published state if needed
          if (ch.published) {
            await updateChapterAction(created._id.toString(), { published: true });
          }
          // Convert ChapterData to Chapter format
          const createdChapter: Chapter = {
            _id: created._id.toString(),
            title: created.title,
            content: created.content,
            order: created.order,
            published: ch.published,
            publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
            unPublishedAt: created.unPublishedAt ? created.unPublishedAt.toISOString() : null,
            publishedBy: created.publishedBy || null,
            unPublishedBy: created.unPublishedBy || null
          };
          setChapters((arr) => arr.map((a) => (a === ch ? createdChapter : a)));
        }
      }

      // After a successful edit, refresh original story snapshot
      try {
        const { getStoryWithChaptersAction } = await import('@/app/actions');
        const sdata = await getStoryWithChaptersAction(storyId);
        setOrigStory(sdata || null);
      } catch {
        // ignore
      }
      return { ok: true };
    } finally {
      setSubmitting(false);
    }
  }

  // Apply a shallow patch to the loaded original story snapshot
  const applyOrigStoryPatch = (patch: Partial<Story>) => {
    setOrigStory((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch };
    });
  };

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
    setChapterPublished,
    create,
    edit,
    applyOrigStoryPatch,
    // allow caller to refresh loaded data
    reload: loadStoryAndChapters,
  };
}
