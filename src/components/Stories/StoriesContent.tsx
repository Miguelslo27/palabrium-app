"use client";

import React, { useEffect, useState } from 'react';
import StoryList from '@/components/StoryList';
import StoriesToolbar from '@/components/Stories/StoriesToolbar';
import type { Story } from '@/types/story';

type Props = {
  loading: boolean;
  unauthorized?: boolean;
  stories: Story[];
  onDelete?: (id: string) => void;
  allowDelete?: boolean;
  emptyMessage?: React.ReactNode;
};

export default function StoriesContent({ loading, unauthorized, stories, onDelete, allowDelete = false, emptyMessage }: Props) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    try {
      const v = localStorage.getItem('stories.view');
      if (v === 'grid' || v === 'list') setView(v);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('stories.view', view);
    } catch (e) {
      // ignore
    }
  }, [view]);

  if (loading) return <div className="text-gray-600">Loading stories…</div>;
  if (unauthorized) return <div className="text-red-600">You must be signed in to see your stories.</div>;
  if (!stories || stories.length === 0) return <div className="text-gray-600">{emptyMessage ?? 'No stories found.'}</div>;

  return (
    <div>
      <StoriesToolbar count={stories.length} view={view} onChangeView={(v) => setView(v)} />
      <StoryList stories={stories} onDelete={onDelete} allowDelete={allowDelete} view={view} />
    </div>
  );
}
