"use client";

import React, { useEffect } from 'react';

type Chapter = { title: string; content: string };

type Props = {
  chapter?: Chapter | null;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
};

export default function ChapterReader({ chapter, index, total, onNext, onPrev }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext, onPrev]);

  if (!chapter) return <div className="text-gray-600">No chapter selected</div>;

  return (
    <article>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">{chapter.title}</h3>
        <div className="text-sm text-gray-600">{index + 1} / {total}</div>
      </div>

      <div className="prose max-w-none whitespace-pre-wrap">{chapter.content}</div>

      <div className="mt-6 flex gap-2">
        <button onClick={onPrev} className="px-3 py-1 border rounded disabled:opacity-50" disabled={index <= 0}>Prev</button>
        <button onClick={onNext} className="px-3 py-1 border rounded disabled:opacity-50" disabled={index >= total - 1}>Next</button>
      </div>
    </article>
  );
}
