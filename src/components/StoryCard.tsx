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
            aria-label="Delete story"
            title="Delete story"
            className="h-8 w-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
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