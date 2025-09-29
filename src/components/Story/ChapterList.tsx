"use client";

import React from 'react';

type Chapter = { title: string; content: string };

type Props = {
  chapters: Chapter[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function ChapterList({ chapters, activeIndex, onSelect }: Props) {
  return (
    <nav className="space-y-2">
      {chapters.map((c, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`w-full text-left px-2 py-1 rounded ${i === activeIndex ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}`}
        >
          {i + 1}. {c.title}
        </button>
      ))}
    </nav>
  );
}
