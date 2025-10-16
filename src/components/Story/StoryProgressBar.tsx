'use client';

import { useEffect, useState } from 'react';
import { chapterProgress } from '@/lib/chapterProgress';

export default function StoryProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = chapterProgress.subscribe(({ index, total }) => {
      const value = total > 0 ? (index + 1) / total : 0;
      setProgress(value);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="h-2 w-full bg-gray-200 rounded-b-lg">
      <div
        className="h-2 bg-blue-500 transition-all rounded-b-lg"
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
