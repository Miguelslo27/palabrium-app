'use client';

import StoryCard from '@/components/StoryCard';
import { useUser } from '@clerk/nextjs';

interface Story {
  _id: string;
  title: string;
  description: string;
  authorId: string;
}

interface StoryListProps {
  stories: Story[];
  onDelete?: (id: string) => void;
  showDeleteForOwned?: boolean;
}

export default function StoryList({ stories, onDelete, showDeleteForOwned = false }: StoryListProps) {
  const { user } = useUser();

  return (
    <div className="grid gap-4">
      {stories.map((story) => (
        <StoryCard
          key={story._id}
          story={story}
          showDelete={showDeleteForOwned ? user?.id === story.authorId : !!onDelete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}