"use client";

import { useState } from 'react';
import BravoButton from '@/components/BravoButton';
import Link from 'next/link';

interface Props {
  storyId: string;
  initialBravos: number;
  userBravos: string[];
  authorId?: string | null;
  userId?: string | null;
}

export default function StoryActions({ storyId, initialBravos, userBravos, authorId, userId = null }: Props) {
  const [bravosCount, setBravosCount] = useState<number>(initialBravos);

  const isAuthor = userId && authorId && userId === authorId;

  return (
    <div className="flex items-center gap-3">
      {isAuthor && (
        <Link href={`/story/${storyId}/edit`} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">
          Editar
        </Link>
      )}
      <BravoButton
        storyId={storyId}
        initialBravos={bravosCount}
        userBravos={userBravos}
        userId={userId}
        onToggle={(count) => { setBravosCount(count); }}
      />
    </div>
  );
}
