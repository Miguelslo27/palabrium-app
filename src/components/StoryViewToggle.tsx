"use client";
import React from 'react';

type Props = {
  view: 'grid' | 'list';
  onChange: (v: 'grid' | 'list') => void;
};

export default function StoryViewToggle({ view, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange('grid')}
        aria-pressed={view === 'grid'}
        aria-label="Grid view"
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
          view === 'grid' ? 'bg-gray-200 text-gray-900 ring-2 ring-blue-300' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <span className="sr-only">Grid view</span>
        {/* grid icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="8" height="8" rx="1" />
          <rect x="13" y="3" width="8" height="8" rx="1" />
          <rect x="3" y="13" width="8" height="8" rx="1" />
          <rect x="13" y="13" width="8" height="8" rx="1" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onChange('list')}
        aria-pressed={view === 'list'}
        aria-label="List view"
        className={`w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
          view === 'list' ? 'bg-gray-200 text-gray-900 ring-2 ring-blue-300' : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <span className="sr-only">List view</span>
        {/* list icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <rect x="3" y="5" width="4" height="4" rx="1" />
          <rect x="3" y="11" width="4" height="4" rx="1" />
          <rect x="3" y="17" width="4" height="4" rx="1" />
        </svg>
      </button>
    </div>
  );
}
