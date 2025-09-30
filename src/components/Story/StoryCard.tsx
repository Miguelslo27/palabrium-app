import Link from 'next/link';
import { useState, useEffect } from 'react';
import getClientUserId from '@/lib/getClientUserId';

import type { Story } from '@/types/story';
import IconExternal from '@/components/Editor/Shared/IconExternal';
import IconTrash from '@/components/Editor/Shared/IconTrash';
import BravoButton from '@/components/BravoButton';

interface StoryCardProps {
  story: Story;
  showDelete?: boolean;
  view?: 'grid' | 'list';
  isMine?: boolean;
  showYoursBadge?: boolean;
  onDelete?: (id: string) => void;
}

export default function StoryCard({ story, showDelete = false, onDelete, view = 'grid', isMine = false, showYoursBadge = true }: StoryCardProps) {
  const chapterCount = typeof story.chapterCount === 'number' ? story.chapterCount : (story.chapters?.length || 0);
  const createdDate = story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Unknown';
  const [bravosCount, setBravosCount] = useState<number>(story.bravos?.length ?? 0);
  const [braved, setBraved] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    getClientUserId().then((id) => {
      if (!mounted) return;
      // only initialize braved if it hasn't been set yet
      if (typeof braved === 'undefined') {
        setBraved(id ? (story.bravos ?? []).includes(id) : false);
      }
    });
    return () => { mounted = false; };
  }, [story.bravos]);

  if (view === 'list') {
    return (
      <div className={`${isMine ? 'border-l-4 border-blue-400' : ''} bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex items-start gap-4`}>
        <div className="flex-1">
          {(isMine && showYoursBadge) && (
            <div className="inline-block mb-2">
              <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Yours</span>
            </div>
          )}
          <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            <Link href={showDelete ? `/story/${story._id}/edit` : `/story/${story._id}`}>
              {story.title}
            </Link>
          </h2>
          <p className="text-gray-700 mt-2 line-clamp-3">{story.description}</p>
          <div className="mt-3 text-sm text-gray-500 flex gap-4">
            <span>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</span>
            <span>Created {createdDate}</span>
            <div>
              <BravoButton
                storyId={story._id}
                initialBravos={bravosCount}
                userBravos={story.bravos ?? []}
                onToggle={(count, newBraved) => { setBravosCount(count); setBraved(newBraved); }}
                braved={braved}
              />
            </div>
          </div>
        </div>

        {showDelete && onDelete && (
          <div className="flex flex-col gap-2">
            <Link href={`/story/${story._id}`} target="_blank" rel="noopener noreferrer" aria-label="Preview story" title="Preview story" className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">
              <IconExternal className="h-4 w-4" />
            </Link>

            <button
              onClick={() => onDelete(story._id)}
              aria-label="Delete story"
              title="Delete story"
              className="h-8 w-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // grid card
  return (
    <div className={`${isMine ? 'border-l-4 border-blue-400' : ''} bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
          <Link href={showDelete ? `/story/${story._id}/edit` : `/story/${story._id}`}>
            {story.title}
          </Link>
        </h2>
        {(isMine && showYoursBadge) && (
          <div className="ml-3">
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Yours</span>
          </div>
        )}
        {showDelete && onDelete && (
          <div className="flex items-center gap-2">
            <Link href={`/story/${story._id}`} target="_blank" rel="noopener noreferrer" aria-label="Preview story" title="Preview story" className="h-8 w-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded">
              <IconExternal className="h-4 w-4" />
            </Link>

            <button
              onClick={() => onDelete(story._id)}
              aria-label="Delete story"
              title="Delete story"
              className="h-8 w-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <p className="text-gray-700 mb-4 line-clamp-3 flex-1">{story.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
        <span>{chapterCount} chapter{chapterCount !== 1 ? 's' : ''}</span>
        <div className="flex items-center gap-4">
          <span>Created {createdDate}</span>
          <BravoButton
            storyId={story._id}
            initialBravos={bravosCount}
            userBravos={story.bravos ?? []}
            onToggle={(count, newBraved) => { setBravosCount(count); setBraved(newBraved); }}
            braved={braved}
          />
        </div>
      </div>
    </div>
  );
}