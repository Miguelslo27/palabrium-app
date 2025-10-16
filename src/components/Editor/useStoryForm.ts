"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  createChapterAction,
  createStoryAction,
  deleteChapterAction,
  updateChapterAction,
  updateStoryAction,
} from '@/app/actions';

interface StoryState {
  _id?: string;
  title?: string;
  description?: string;
  published?: boolean;
  publishedAt?: string | null;
  unPublishedAt?: string | null;
  publishedBy?: string | null;
  unPublishedBy?: string | null;
}

interface ChapterState {
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
  initialStory?: StoryState | null;
  initialChapters?: ChapterState[];
};

const createEmptyChapter = (): ChapterState => ({ title: '', content: '' });

const normalizeStory = (story?: StoryState | null): StoryState | null => {
  if (!story) return null;
  return {
    _id: story._id,
    title: story.title ?? '',
    description: story.description ?? '',
    published: Boolean(story.published),
    publishedAt: story.publishedAt ?? null,
    unPublishedAt: story.unPublishedAt ?? null,
    publishedBy: story.publishedBy ?? null,
    unPublishedBy: story.unPublishedBy ?? null,
  };
};

const normalizeChapter = (chapter: ChapterState): ChapterState => ({
  _id: chapter._id,
  title: chapter.title ?? '',
  content: chapter.content ?? '',
  order: typeof chapter.order === 'number' ? chapter.order : 0,
  published: Boolean(chapter.published),
  publishedAt: chapter.publishedAt ?? null,
  unPublishedAt: chapter.unPublishedAt ?? null,
  publishedBy: chapter.publishedBy ?? null,
  unPublishedBy: chapter.unPublishedBy ?? null,
});

export default function useStoryForm(options: UseStoryFormOpts) {
  const {
    mode = 'create',
    storyId,
    initialStory = null,
    initialChapters = [],
  } = options;
  const normalizedStory = useMemo(() => normalizeStory(initialStory), [initialStory]);
  const normalizedChapters = useMemo(
    () =>
      initialChapters.length
        ? initialChapters.map(normalizeChapter)
        : mode === 'create'
          ? [createEmptyChapter()]
          : [],
    [initialChapters, mode]
  );

  const [title, setTitle] = useState<string>(normalizedStory?.title ?? '');
  const [description, setDescription] = useState<string>(normalizedStory?.description ?? '');
  const [origStory, setOrigStory] = useState<StoryState | null>(normalizedStory);
  const [chapters, setChapters] = useState<ChapterState[]>(normalizedChapters);
  const [origChapters, setOrigChapters] = useState<ChapterState[]>(normalizedChapters);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(normalizedChapters.length ? 0 : null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(normalizedStory?.title ?? '');
    setDescription(normalizedStory?.description ?? '');
    setOrigStory(normalizedStory);
  }, [normalizedStory?.title, normalizedStory?.description, normalizedStory]);

  useEffect(() => {
    setChapters(normalizedChapters);
    setOrigChapters(normalizedChapters);
    setExpandedIndex(normalizedChapters.length ? 0 : null);
  }, [normalizedChapters]);

  const addChapter = () => {
    const next = [...chapters, createEmptyChapter()];
    setChapters(next);
    setExpandedIndex(next.length - 1);
  };

  const removeChapter = (index: number) => {
    if (chapters.length === 1) return;
    const next = chapters.filter((_, i) => i !== index);
    setChapters(next);
    if (expandedIndex === null) return;
    if (expandedIndex === index) setExpandedIndex(null);
    else if (expandedIndex > index) setExpandedIndex(expandedIndex - 1);
  };

  const updateChapterLocal = (index: number, field: string, value: string) => {
    setChapters((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
    setChapters((prev) => {
      const next = [...prev];
      const chapter = next[index];
      if (!chapter) return prev;

      if (typeof payload === 'boolean') {
        next[index] = { ...chapter, published: Boolean(payload) };
      } else {
        next[index] = {
          ...chapter,
          published: Boolean(payload.published),
          publishedAt: payload.publishedAt ?? chapter.publishedAt ?? null,
          unPublishedAt: payload.unPublishedAt ?? chapter.unPublishedAt ?? null,
          publishedBy: payload.publishedBy ?? chapter.publishedBy ?? null,
          unPublishedBy: payload.unPublishedBy ?? chapter.unPublishedBy ?? null,
        };
      }

      return next;
    });
  };

  async function create(payload: { title: string; description: string; chapters: ChapterState[] }) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const story = await createStoryAction({
        title: payload.title,
        description: payload.description,
      });

      for (let index = 0; index < payload.chapters.length; index++) {
        const chapter = payload.chapters[index];
        const created = await createChapterAction({
          storyId: story._id,
          title: chapter.title,
          content: chapter.content,
          order: index,
        });

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
      if (!origStory || origStory.title !== title || origStory.description !== description) {
        await updateStoryAction(storyId, { title, description });
      }

      const nextIds = new Set(chapters.filter((c) => c._id).map((c) => String(c._id)));

      for (const chapter of origChapters) {
        if (chapter._id && !nextIds.has(String(chapter._id))) {
          await deleteChapterAction(chapter._id, storyId);
        }
      }

      const nextChapters: ChapterState[] = [];

      for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        if (chapter._id) {
          const previous = origChapters.find((c) => c._id === chapter._id);
          const changed =
            !previous ||
            previous.title !== chapter.title ||
            previous.content !== chapter.content ||
            Boolean(previous.published) !== Boolean(chapter.published) ||
            Number(previous.order ?? 0) !== index;

          if (changed) {
            const updated = await updateChapterAction(chapter._id, {
              title: chapter.title,
              content: chapter.content,
              order: index,
              published: Boolean(chapter.published),
            });

            nextChapters.push(
              normalizeChapter({
                _id: updated._id.toString(),
                title: updated.title,
                content: updated.content,
                order: updated.order,
                published: updated.published,
                publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
                unPublishedAt: updated.unPublishedAt ? updated.unPublishedAt.toISOString() : null,
                publishedBy: updated.publishedBy || null,
                unPublishedBy: updated.unPublishedBy || null,
              })
            );
          } else {
            nextChapters.push({ ...normalizeChapter({ ...chapter, order: index }) });
          }
        } else {
          const created = await createChapterAction({
            storyId,
            title: chapter.title,
            content: chapter.content,
            order: index,
          });

          let publishedPayload = {
            published: Boolean(chapter.published),
            publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
            unPublishedAt: created.unPublishedAt ? created.unPublishedAt.toISOString() : null,
            publishedBy: created.publishedBy || null,
            unPublishedBy: created.unPublishedBy || null,
          };

          if (chapter.published) {
            const updated = await updateChapterAction(created._id.toString(), { published: true });
            publishedPayload = {
              published: updated.published,
              publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
              unPublishedAt: updated.unPublishedAt ? updated.unPublishedAt.toISOString() : null,
              publishedBy: updated.publishedBy || null,
              unPublishedBy: updated.unPublishedBy || null,
            };
          }

          nextChapters.push(
            normalizeChapter({
              _id: created._id.toString(),
              title: created.title,
              content: created.content,
              order: created.order,
              ...publishedPayload,
            })
          );
        }
      }

      setOrigStory((prev) => (prev ? { ...prev, title, description } : prev));
      setOrigChapters(nextChapters);
      setChapters(nextChapters);

      return { ok: true };
    } finally {
      setSubmitting(false);
    }
  }

  const applyOrigStoryPatch = (patch: Partial<StoryState>) => {
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
  };
}
