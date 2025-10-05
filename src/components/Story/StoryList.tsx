"use client";

import { useUser } from '@clerk/nextjs'
import StoryCard from '@/components/Story/StoryCard';
import type { Story } from '@/types/story';

type ViewMode = 'grid' | 'list';

interface StoryListProps {
  stories: Story[];
  allowDelete?: boolean;
  view?: ViewMode;
  showYoursBadge?: boolean;
  onDelete?: (id: string) => void;
  onChangeView?: (v: ViewMode) => void;
}

export default function StoryList({ stories, onDelete, allowDelete = false, view, showYoursBadge = true }: StoryListProps) {
  const { user } = useUser();
  const userId = user?.id || null;

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
              isMine={!!userId && story.authorId === userId}
              showYoursBadge={showYoursBadge}
              userId={userId}
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
              isMine={!!userId && story.authorId === userId}
              showYoursBadge={showYoursBadge}
              userId={userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}