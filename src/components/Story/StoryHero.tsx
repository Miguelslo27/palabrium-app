"use client";

import React, { useEffect, useState } from 'react';
import { chapterProgress } from '@/lib/chapterProgress';
import Hero from '@/components/Common/Hero';

type Props = {
  initialTitle?: string;
};

export default function StoryHero({ initialTitle }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsub = chapterProgress.subscribe(({ index, total }) => {
      const p = total > 0 ? (index + 1) / total : 0;
      setProgress(p);
    });
    return unsub;
  }, []);

  return (
    <Hero className="w-full mb-6 !p-0">
      <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 rounded-lg">
        <h2 className="text-2xl font-semibold">{initialTitle}</h2>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-b-lg">
        <div className="h-2 bg-blue-500 transition-all rounded-b-lg" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </Hero>
  );
}
