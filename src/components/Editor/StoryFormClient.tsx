"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import EditorForm from '@/components/Editor/EditorForm';
import EditorHeader from '@/components/Editor/EditorHeader';
import Sidebar from '@/components/Editor/Sidebar';
import Chapters from '@/components/Editor/Chapters';
import Button from '@/components/Editor/Shared/Button';
import useStoryForm from '@/components/Editor/useStoryForm';

type Props = {
  mode?: 'create' | 'edit';
  storyId?: string;
  onSaved?: (id: string) => void;
};

export default function StoryFormClient({ mode = 'create', storyId, onSaved }: Props) {
  const router = useRouter();
  const {
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
  } = useStoryForm({ mode, storyId });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'create') {
      // prepare payload with order and published
      const payloadChapters = chapters.map((c, i) => ({ title: c.title || '', content: c.content || '', order: i, published: Boolean(c.published) }));
      try {
        const data = await create({ title, description, chapters: payloadChapters });
        if (onSaved) onSaved(data.id);
        router.push(`/story/${data.id}`);
      } catch (err) {
        console.error('create', err);
        alert('Error creating story');
      }
      return;
    }

    try {
      await edit();
      if (onSaved && storyId) onSaved(storyId);
      // stay on the edit form after saving (no navigation)
    } catch (err) {
      console.error('edit', err);
      alert('Error saving story');
    }
  }

  return (
    <EditorForm onSubmit={handleSubmit}>
      <EditorHeader title={mode === 'create' ? 'Create story' : 'Edit story'}>
        <Button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) router.back();
            else router.push('/');
          }}
          className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded text-sm"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={submitting} className="bg-blue-700 disabled:opacity-60 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm shadow">
          {submitting ? 'Saving…' : 'Save'}
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
