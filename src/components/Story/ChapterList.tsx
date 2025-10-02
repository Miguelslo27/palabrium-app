"use client";

import React from 'react';

type Chapter = { title: string; content: string; published?: boolean };

type Props = {
  chapters: Chapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
  viewerIsAuthor?: boolean;
};

export default function ChapterList({ chapters, activeIndex, onSelect, viewerIsAuthor = false }: Props) {
  return (
    <nav className="space-y-2">
      {chapters.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${i === activeIndex ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
        >
          <span className={`${!c.published && viewerIsAuthor ? 'text-gray-500' : ''}`}>{i + 1}. {c.title}</span>
          {!c.published && viewerIsAuthor && (
            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Draft</span>
          )}
        </button>
      ))}
    </nav>
  );
}
