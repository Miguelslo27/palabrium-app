import { useState } from 'react';
import IconTrash from '@/components/Editor/Shared/IconTrash';
import Button from '@/components/Editor/Shared/Button';
import getClientUserId from '@/lib/getClientUserId';

type Chapter = { title: string; content: string; _id?: string; published?: boolean; publishedAt?: string | null };

type PublishedPayload = boolean | { published: boolean; publishedAt?: string | null; publishedBy?: string | null };

type Props = {
  chapters: Chapter[];
  expandedIndex: number | null;
  setExpandedIndex: (i: number | null) => void;
  addChapter: () => void;
  removeChapter: (i: number) => void;
  updateChapter: (i: number, field: string, value: string) => void;
  setChapterPublished?: (i: number, payload: PublishedPayload) => void;
};

function ChapterEditor({ chapter, index, updateChapter, removeChapter, chaptersLength, setChapterPublished, publishLoading, setPublishLoading }: { chapter: Chapter; index: number; updateChapter: (i: number, field: string, value: string) => void; removeChapter: (i: number) => void; chaptersLength: number; setChapterPublished?: (i: number, payload: PublishedPayload) => void; publishLoading?: boolean; setPublishLoading?: (b: boolean) => void; }) {
  const togglePublish = async (publish: boolean) => {
    if (!chapter._id) return;
    try {
      setPublishLoading?.(true);
      const userId = await getClientUserId();
      const res = await fetch(`/api/chapters/${chapter._id}/publish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': String(userId) } : {}) },
        body: JSON.stringify({ published: publish }),
      });
      if (!res.ok) throw new Error('Failed to toggle publish chapter');
      const data = await res.json();
      if (typeof setChapterPublished === 'function') setChapterPublished(index, { published: publish, publishedAt: data.publishedAt ?? null, unPublishedAt: data.unPublishedAt ?? null, publishedBy: data.publishedBy ?? null, unPublishedBy: data.unPublishedBy ?? null } as any);
    } catch (err) {
      console.error('toggle publish chapter', err);
    } finally {
      setPublishLoading?.(false);
    }
  };

  return (
    <section className="p-4">
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
          <div className="flex items-center gap-2">
            {chapter._id && (
              !chapter.published ? (
                <button
                  onClick={async () => {
                    await togglePublish(true);
                  }}
                  title="Publish chapter"
                  className="h-10 w-10 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                  disabled={publishLoading}
                >
                  {publishLoading ? '...' : 'P'}
                </button>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      await togglePublish(false);
                    }}
                    title="Unpublish chapter"
                    className="h-10 w-10 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-50"
                    disabled={publishLoading}
                  >
                    {publishLoading ? '...' : 'U'}
                  </button>
                </>
              )
            )}

            <Button
              type="button"
              onClick={() => removeChapter(index)}
              disabled={chaptersLength === 1}
              aria-label="Remove chapter"
              title="Remove chapter"
              className="h-10 w-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Content</label>
        <textarea
          placeholder=""
          value={chapter.content}
          onChange={(e) => updateChapter(index, 'content', e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-48 resize-vertical"
          required
        />
      </div>
    </section>
  );
}

function ChapterCard({ chapter, index, isOpen, onToggle, removeChapter, updateChapter, chaptersLength, setChapterPublished }: { chapter: Chapter; index: number; isOpen: boolean; onToggle: () => void; removeChapter: (i: number) => void; updateChapter: (i: number, field: string, value: string) => void; chaptersLength: number; setChapterPublished?: (i: number, payload: PublishedPayload) => void; }) {
  const displayTitle = chapter.title?.trim() ? chapter.title : `Chapter ${index + 1}`;
  const [publishLoading, setPublishLoading] = useState(false);

  return (
    <div className="bg-gray-50 border border-gray-300 rounded">
      {!isOpen && (
        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-900">{displayTitle}</span>
            {chapter.published && (
              <span className="ml-2 inline-block text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Published</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {chapter._id && (
              !chapter.published ? (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      setPublishLoading(true);
                      const userId = await getClientUserId();
                      const res = await fetch(`/api/chapters/${chapter._id}/publish`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': String(userId) } : {}) },
                        body: JSON.stringify({ published: true }),
                      });
                      if (!res.ok) throw new Error('Failed to publish chapter');
                      const data = await res.json();
                      if (typeof setChapterPublished === 'function') setChapterPublished(index, { published: true, publishedAt: data.publishedAt ?? null, unPublishedAt: data.unPublishedAt ?? null, publishedBy: data.publishedBy ?? null, unPublishedBy: data.unPublishedBy ?? null } as any);
                    } catch (err) {
                      console.error('publish chapter', err);
                    } finally {
                      setPublishLoading(false);
                    }
                  }}
                  title="Publish chapter"
                  className="h-8 w-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
                  disabled={publishLoading}
                >
                  {publishLoading ? '...' : 'P'}
                </button>
              ) : (
                <>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        setPublishLoading(true);
                        const userId = await getClientUserId();
                        const res = await fetch(`/api/chapters/${chapter._id}/publish`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json', ...(userId ? { 'x-user-id': String(userId) } : {}) },
                          body: JSON.stringify({ published: false }),
                        });
                        if (!res.ok) throw new Error('Failed to unpublish chapter');
                        const data = await res.json();
                        if (typeof setChapterPublished === 'function') setChapterPublished(index, { published: false, publishedAt: data.publishedAt ?? null, unPublishedAt: data.unPublishedAt ?? null, publishedBy: data.publishedBy ?? null, unPublishedBy: data.unPublishedBy ?? null } as any);
                      } catch (err) {
                        console.error('unpublish chapter', err);
                      } finally {
                        setPublishLoading(false);
                      }
                    }}
                    title="Unpublish chapter"
                    className="h-8 w-8 flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-50"
                    disabled={publishLoading}
                  >
                    {publishLoading ? '...' : 'U'}
                  </button>
                </>
              )
            )}

            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChapter(index);
              }}
              disabled={chaptersLength === 1}
              aria-label="Remove chapter"
              title="Remove chapter"
              className="h-8 w-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div>
          <ChapterEditor chapter={chapter} index={index} updateChapter={updateChapter} removeChapter={removeChapter} chaptersLength={chaptersLength} setChapterPublished={setChapterPublished} publishLoading={publishLoading} setPublishLoading={setPublishLoading} />
        </div>
      )}
    </div>
  );
}

export default function Chapters({ chapters, expandedIndex, setExpandedIndex, addChapter, removeChapter, updateChapter, setChapterPublished }: Props) {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white border border-gray-300 rounded shadow-sm h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chapters ({chapters.length})</h2>
        </div>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {chapters.map((chapter, index) => {
            const isOpen = expandedIndex === index;
            return (
              <ChapterCard
                key={index}
                chapter={chapter}
                index={index}
                isOpen={isOpen}
                onToggle={() => setExpandedIndex(isOpen ? null : index)}
                removeChapter={removeChapter}
                updateChapter={updateChapter}
                chaptersLength={chapters.length}
                setChapterPublished={setChapterPublished}
              />
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-300 bg-gray-50 flex items-center justify-between">
          <Button type="button" onClick={addChapter} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-800 border border-gray-400 rounded shadow-sm">
            <span className="text-xl font-bold">+</span>
            <span>Agregar capítulo</span>
          </Button>
          <div />
        </div>
      </div>
    </main>
  );
}
