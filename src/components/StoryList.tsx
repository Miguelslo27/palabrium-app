'use client';

import { useEffect, useState } from 'react';
import StoryCard from '@/components/StoryCard';
import type { Story } from '@/types/story';

type ViewMode = 'grid' | 'list';

interface StoryListProps {
  stories: Story[];
  onDelete?: (id: string) => void;
  // allowDelete indicates the list should render delete controls for items
  // (used only on the My Stories page where we know the listed stories belong to the current user)
  allowDelete?: boolean;
}

export default function StoryList({ stories, onDelete, allowDelete = false }: StoryListProps) {
  const [view, setView] = useState<ViewMode>('grid');

  // persist user's preference locally
  useEffect(() => {
    try {
      const v = localStorage.getItem('stories.view');
      if (v === 'grid' || v === 'list') setView(v);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('stories.view', view);
    } catch (e) {
      // ignore
    }
  }, [view]);

  return (
    <div>
      {/* Action bar: toggle grid/list */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600">Showing {stories.length} stories</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
            className={`px-3 py-1 rounded-md text-sm ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={`px-3 py-1 rounded-md text-sm ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            List
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))' }}>
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              view="grid"
              showDelete={allowDelete && !!onDelete}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              story={story}
              view="list"
              showDelete={allowDelete && !!onDelete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}