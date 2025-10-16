"use client";

import React, { useCallback, useEffect, useState } from 'react';
import ChapterList from './ChapterList';
import ChapterReader from './ChapterReader';
import { chapterProgress } from '@/lib/chapterProgress';

type Chapter = { title: string; content: string; published?: boolean };

interface ChapterNavigatorProps {
  chapters: Chapter[];
  initialIndex?: number;
  viewerIsAuthor: boolean;
  metadata?: React.ReactNode;
}

export default function ChapterNavigator({
  chapters,
  initialIndex = 0,
  viewerIsAuthor,
  metadata,
}: ChapterNavigatorProps) {
  const [index, setIndex] = useState(
    Math.max(0, Math.min(initialIndex, chapters.length - 1)),
  );

  const onSelect = useCallback((i: number) => setIndex(i), []);
  const onNext = useCallback(
    () => setIndex((i) => Math.min(i + 1, chapters.length - 1)),
    [chapters.length],
  );
  const onPrev = useCallback(
    () => setIndex((i) => Math.max(i - 1, 0)),
    [],
  );

  useEffect(() => {
    chapterProgress.publish({ index, total: chapters.length });
  }, [index, chapters.length]);

  if (chapters.length === 0) {
    return (
      <div className="text-gray-600">
        {viewerIsAuthor
          ? 'No chapters yet. Start drafting your story!'
          : 'This story has no published chapters yet.'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <aside className="md:col-span-1">
        <div className="sticky top-0 space-y-4">
          {metadata}
          <ChapterList
            chapters={chapters}
            activeIndex={index}
            onSelect={onSelect}
            viewerIsAuthor={viewerIsAuthor}
          />
        </div>
      </aside>

      <main className="md:col-span-3">
        <ChapterReader
          chapter={chapters[index] || null}
          index={index}
          total={chapters.length}
          onNext={onNext}
          onPrev={onPrev}
          viewerIsAuthor={viewerIsAuthor}
        />
      </main>
    </div>
  );
}
