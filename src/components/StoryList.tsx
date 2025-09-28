'use client';

import StoryCard from '@/components/StoryCard';
import type { Story } from '@/types/story';

interface StoryListProps {
  stories: Story[];
  onDelete?: (id: string) => void;
  // allowDelete indicates the list should render delete controls for items
  // (used only on the My Stories page where we know the listed stories belong to the current user)
  allowDelete?: boolean;
}

export default function StoryList({ stories, onDelete, allowDelete = false }: StoryListProps) {
  return (
    <div className="grid gap-4">
      {stories.map((story) => (
        <StoryCard
          key={story._id}
          story={story}
          showDelete={allowDelete && !!onDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}