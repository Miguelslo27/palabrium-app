"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import BravoButton from '@/components/BravoButton';
import Link from 'next/link';

interface Props {
  storyId: string;
  initialBravos: number;
  userBravos: string[];
  authorId?: string | null;
}

export default function StoryActions({ storyId, initialBravos, userBravos, authorId }: Props) {
  const { userId, isAuthor: checkIsAuthor } = useUser();
  const [bravosCount, setBravosCount] = useState<number>(initialBravos);
  const [braved, setBraved] = useState<boolean | undefined>(undefined);

  const isAuthor = checkIsAuthor(authorId);

  useEffect(() => {
    setBraved(userId ? userBravos.includes(userId) : false);
  }, [userId, userBravos]);

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
        braved={braved}
        onToggle={(count, newBraved) => { setBravosCount(count); setBraved(newBraved); }}
      />
    </div>
  );
}
