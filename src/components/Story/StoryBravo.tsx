"use client";

import { useEffect, useState } from 'react';
import getClientUserId from '@/lib/getClientUserId';
import BravoButton from '@/components/BravoButton';

interface Props {
  storyId: string;
  initialBravos: number;
  userBravos: string[];
}

export default function StoryBravo({ storyId, initialBravos, userBravos }: Props) {
  const [bravosCount, setBravosCount] = useState<number>(initialBravos);
  const [braved, setBraved] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    getClientUserId().then((id) => {
      if (!mounted) return;
      setBraved(id ? userBravos.includes(id) : false);
    });
    return () => { mounted = false; };
  }, [userBravos]);

  return (
    <div className="flex items-center gap-3">
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
