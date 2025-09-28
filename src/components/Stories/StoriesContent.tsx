"use client";

import React from 'react';
import StoryList from '@/components/StoryList';
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
  if (loading) return <div className="text-gray-600">Loading stories…</div>;
  if (unauthorized) return <div className="text-red-600">You must be signed in to see your stories.</div>;
  if (!stories || stories.length === 0) return <div className="text-gray-600">{emptyMessage ?? 'No stories found.'}</div>;

  return <StoryList stories={stories} onDelete={onDelete} allowDelete={allowDelete} />;
}
