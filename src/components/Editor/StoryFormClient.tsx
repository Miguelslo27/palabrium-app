"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import EditorForm from '@/components/Editor/EditorForm';
import EditorHeader from '@/components/Editor/EditorHeader';
import Sidebar from '@/components/Editor/Sidebar';
import Chapters from '@/components/Editor/Chapters';
import Button from '@/components/Editor/Shared/Button';
import useStoryForm from '@/components/Editor/useStoryForm';
import getClientUserId from '@/lib/getClientUserId';
import { toggleStoryPublish } from '@/lib/useStories';
import IconExternal from '@/components/Editor/Shared/IconExternal';

type Props = {
  mode?: 'create' | 'edit';
  storyId?: string;
  onSaved?: (id: string) => void;
};

export default function StoryFormClient({ mode = 'create', storyId, onSaved }: Props) {
  const router = useRouter();
  const [publishLoading, setPublishLoading] = useState(false);
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
    setChapterPublished,
    create,
    edit,
    reload,
    applyOrigStoryPatch,
  } = useStoryForm({ mode, storyId });

  async function handleSubmit(e: FormEvent) {
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
        {mode === 'edit' && storyId && (
          <>
            {origStory && origStory.published ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-green-700">Published</span>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      setPublishLoading(true);
                      const data = await toggleStoryPublish(String(storyId), false);
                      applyOrigStoryPatch({ published: false, publishedAt: data.publishedAt ?? null, unPublishedAt: data.unPublishedAt ?? null, publishedBy: data.publishedBy ?? null, unPublishedBy: data.unPublishedBy ?? null });
                    } catch (err) {
                      console.error('unpublish', err);
                    } finally {
                      setPublishLoading(false);
                    }
                  }}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded text-sm"
                  disabled={publishLoading}
                >
                  {publishLoading ? 'Unpublishing...' : 'Unpublish'}
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={async () => {
                  if (!storyId) return;
                  try {
                    setPublishLoading(true);
                    const data = await toggleStoryPublish(String(storyId), true);
                    applyOrigStoryPatch({ published: true, publishedAt: data.publishedAt ?? null, unPublishedAt: data.unPublishedAt ?? null, publishedBy: data.publishedBy ?? null, unPublishedBy: data.unPublishedBy ?? null });
                  } catch (err) {
                    console.error('publish', err);
                  } finally {
                    setPublishLoading(false);
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm"
                disabled={publishLoading}
              >
                {publishLoading ? 'Publishing...' : 'Publish'}
              </Button>
            )}
          </>
        )}
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
        {mode === 'edit' && storyId && (
          <Button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.open(`/story/${storyId}`, '_blank', 'noopener,noreferrer');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-3 rounded text-sm flex items-center gap-2"
          >
            <IconExternal className="h-4 w-4" />
            Preview
          </Button>
        )}
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
          setChapterPublished={setChapterPublished}
        />
      </div>
    </EditorForm>
  );
}
