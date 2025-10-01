import React from 'react';
import IconTrash from '@/components/Editor/Shared/IconTrash';
import IconEye from '@/components/Editor/Shared/IconEye';
import IconEyeOff from '@/components/Editor/Shared/IconEyeOff';
import getClientUserId from '@/lib/getClientUserId';

type Chapter = { title: string; content: string; _id?: string; published?: boolean; publishedAt?: string | null };
type PublishedPayload = boolean | { published: boolean; publishedAt?: string | null; publishedBy?: string | null };

type Props = {
  chapter: Chapter;
  index: number;
  chaptersLength: number;
  removeChapter: (i: number) => void;
  setChapterPublished?: (i: number, payload: PublishedPayload) => void;
  publishLoading?: boolean;
  setPublishLoading?: (b: boolean) => void;
  compact?: boolean; // compact controls (small icons) used in header
};

export default function ChapterControls({ chapter, index, chaptersLength, removeChapter, setChapterPublished, publishLoading, setPublishLoading, compact = true }: Props) {
  const sizeClass = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';

  const togglePublish = async (publish: boolean) => {
    if (!chapter._id) return; // guard
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
    <div className="flex items-center gap-2">
      {chapter._id && (
        !chapter.published ? (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await togglePublish(true);
            }}
            title="Publish chapter"
            className={`${sizeClass} flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50`}
            disabled={publishLoading}
          >
            {publishLoading ? '...' : <IconEye className={iconSize} />}
          </button>
        ) : (
          <>
            <button
              onClick={async (e) => {
                e.stopPropagation();
                await togglePublish(false);
              }}
              title="Unpublish chapter"
              className={`${sizeClass} flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white rounded disabled:opacity-50`}
              disabled={publishLoading}
            >
              {publishLoading ? '...' : <IconEyeOff className={iconSize} />}
            </button>
          </>
        )
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          removeChapter(index);
        }}
        aria-label="Remove chapter"
        title="Remove chapter"
        className={`${sizeClass} flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed`}
        disabled={chaptersLength === 1}
      >
        <IconTrash className={iconSize} />
      </button>
    </div>
  );
}
