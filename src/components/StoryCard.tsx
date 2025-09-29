import Link from 'next/link';

import type { Story } from '@/types/story';

interface StoryCardProps {
  story: Story;
  showDelete?: boolean;
  onDelete?: (id: string) => void;
  view?: 'grid' | 'list';
}

export default function StoryCard({ story, showDelete = false, onDelete, view = 'grid' }: StoryCardProps) {
  const chapterCount = typeof story.chapterCount === 'number' ? story.chapterCount : (story.chapters?.length || 0);
  const createdDate = story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Unknown';

  if (view === 'list') {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            <Link href={showDelete ? `/story/${story._id}/edit` : `/story/${story._id}`}>
              {story.title}
            </Link>
          </h2>
          <p className="text-gray-700 mt-2 line-clamp-3">{story.description}</p>
          <div className="mt-3 text-sm text-gray-500 flex gap-4">
            <span>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</span>
            <span>Created {createdDate}</span>
          </div>
        </div>

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
    );
  }

  // grid card
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <Link href={showDelete ? `/story/${story._id}/edit` : `/story/${story._id}`}>
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
      <p className="text-gray-700 mb-4 line-clamp-3 flex-1">{story.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
        <span>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</span>
        <span>Created {createdDate}</span>
      </div>
    </div>
  );
}