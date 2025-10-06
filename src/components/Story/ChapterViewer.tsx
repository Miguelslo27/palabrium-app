"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ChapterList from './ChapterList';
import ChapterReader from './ChapterReader';
import { chapterProgress } from '@/lib/chapterProgress';

type Chapter = { title: string; content: string; published?: boolean };

type Props = {
  chapters: Chapter[];
  initialIndex?: number;
  title?: string;
  authorId?: string | null;
  authorName?: string | null;
  createdAt?: string | null;
  chapterCount?: number | null;
  description?: string | null;
  userId?: string | null;
};

export default function ChapterViewer({ chapters, initialIndex = 0, title, authorId, authorName, createdAt, chapterCount, description, userId = null }: Props) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialIndex, chapters.length - 1)));

  // Check if viewer is the author
  const viewerIsAuthor = !!(userId && authorId && userId === authorId);

  // Filter chapters based on authorship
  const visibleChapters = viewerIsAuthor ? chapters : chapters.filter(c => Boolean(c.published));

  const onSelect = useCallback((i: number) => setIndex(i), []);
  const onNext = useCallback(() => setIndex(i => Math.min(i + 1, visibleChapters.length - 1)), [visibleChapters.length]);
  const onPrev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);

  // publish progress when index changes
  useEffect(() => {
    chapterProgress.publish({ index, total: visibleChapters.length });
  }, [index, visibleChapters.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside className="md:col-span-1 bg-white/60 p-4 rounded border">
        <div className="sticky top-0 ">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">{title}</h2>
            <div className="text-sm text-gray-600">
              <div>Author: {authorName || 'Unknown'}</div>
              <div>Created: {createdAt ? new Date(createdAt).toLocaleString() : '—'}</div>
              <div>Chapters: {chapterCount ?? visibleChapters.length}</div>
            </div>
          </div>
          {description && <p className="text-sm text-gray-800 mb-4">{description}</p>}
          <div>
            <h3 className="font-semibold mb-2">Chapters</h3>
            <ChapterList chapters={visibleChapters} activeIndex={index} onSelect={onSelect} viewerIsAuthor={viewerIsAuthor} />
          </div>
        </div>
      </aside>

      <main className="md:col-span-3">
        <ChapterReader chapter={visibleChapters[index] || null} index={index} total={visibleChapters.length} onNext={onNext} onPrev={onPrev} viewerIsAuthor={viewerIsAuthor} />
      </main>
    </div>
  );
}
