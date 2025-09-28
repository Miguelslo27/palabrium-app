"use client";

import React from 'react';
import StoryViewToggle from '@/components/StoryViewToggle';

type Props = {
  count: number;
  view: 'grid' | 'list';
  onChangeView: (v: 'grid' | 'list') => void;
};

export default function StoriesToolbar({ count, view, onChangeView }: Props) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-gray-600">Showing {count} stories</div>
      <div>
        <StoryViewToggle view={view} onChange={onChangeView} />
      </div>
    </div>
  );
}
