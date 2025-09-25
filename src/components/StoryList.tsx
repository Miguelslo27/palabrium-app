'use client';

import StoryCard from '@/components/StoryCard';
import type { Story } from '@/types/story';

interface StoryListProps {
  stories: Story[];
  onDelete?: (id: string) => void;
  showDeleteForOwned?: boolean;
}

export default function StoryList({ stories, onDelete, showDeleteForOwned = false }: StoryListProps) {
  return (
    <div className="grid gap-4">
      {stories.map((story) => (
        <StoryCard
          key={story._id}
          story={story}
          showDelete={!!onDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}