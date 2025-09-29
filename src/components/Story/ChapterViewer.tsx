"use client";

import React, { useState, useCallback } from 'react';
import ChapterList from './ChapterList';
import ChapterReader from './ChapterReader';
import { chapterProgress } from '@/lib/chapterProgress';

type Chapter = { title: string; content: string };

type Props = {
  chapters: Chapter[];
  initialIndex?: number;
  title?: string;
  authorName?: string | null;
  createdAt?: string | null;
  chapterCount?: number | null;
  description?: string | null;
};

export default function ChapterViewer({ chapters, initialIndex = 0, title, authorName, createdAt, chapterCount, description }: Props) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialIndex, chapters.length - 1)));

  const onSelect = useCallback((i: number) => setIndex(i), []);
  const onNext = useCallback(() => setIndex(i => Math.min(i + 1, chapters.length - 1)), [chapters.length]);
  const onPrev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);

  // publish progress when index changes
  React.useEffect(() => {
    chapterProgress.publish({ index, total: chapters.length });
  }, [index, chapters.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside className="md:col-span-1 bg-white/60 p-4 rounded border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-1">{title}</h2>
          <div className="text-sm text-gray-600">
            <div>Author: {authorName || 'Unknown'}</div>
            <div>Created: {createdAt ? new Date(createdAt).toLocaleString() : '—'}</div>
            <div>Chapters: {chapterCount ?? chapters.length}</div>
          </div>
        </div>
        {description && <p className="text-sm text-gray-800 mb-4">{description}</p>}

        <div>
          <h3 className="font-semibold mb-2">Chapters</h3>
          <ChapterList chapters={chapters} activeIndex={index} onSelect={onSelect} />
        </div>
      </aside>

      <main className="md:col-span-3">
        <ChapterReader chapter={chapters[index] || null} index={index} total={chapters.length} onNext={onNext} onPrev={onPrev} />
      </main>
    </div>
  );
}
