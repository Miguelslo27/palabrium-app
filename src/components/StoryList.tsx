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
  // optional controlled view mode
  view?: ViewMode;
  onChangeView?: (v: ViewMode) => void;
}

export default function StoryList({ stories, onDelete, allowDelete = false, view: controlledView, onChangeView }: StoryListProps) {
  const [localView, setLocalView] = useState<ViewMode>('grid');

  // Controlled if `controlledView` is provided, otherwise use local state.
  // Persistence of the preference is owned by the toolbar/parent (`StoriesContent`).
  const view = controlledView ?? localView;
  const setView = (v: ViewMode) => {
    if (onChangeView) return onChangeView(v);
    setLocalView(v);
  };

  return (
    <div>
      {view === 'grid' ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
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