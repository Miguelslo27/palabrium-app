import Link from 'next/link';

import type { Story } from '@/types/story';

interface StoryCardProps {
  story: Story;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
}

export default function StoryCard({ story, showDelete = false, onDelete }: StoryCardProps) {
  const chapterCount = story.chapters?.length || 0;
  const createdDate = story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Unknown';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <Link href={`/story/${story._id}`}>
            {story.title}
          </Link>
        </h2>
        {showDelete && onDelete && (
          <button
            onClick={() => onDelete(story._id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-gray-700 mb-4 line-clamp-3">{story.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</span>
        <span>Created {createdDate}</span>
      </div>
    </div>
  );
}