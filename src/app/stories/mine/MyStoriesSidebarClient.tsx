'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import MineSidebar from '@/components/Stories/MineSidebar';
import { deleteAllStoriesAction } from '@/app/actions';

interface MyStoriesSidebarClientProps {
  storiesCount: number;
}

export default function MyStoriesSidebarClient({ storiesCount }: MyStoriesSidebarClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleClear = () => {
    if (!confirm('Delete ALL your stories? This cannot be undone.')) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteAllStoriesAction();
        router.refresh();
        alert('Deleted all stories');
      } catch (error) {
        alert('Failed to delete stories');
        console.error('Delete all stories error:', error);
      }
    });
  };

  const handleImported = () => {
    router.refresh();
  };

  return (
    <MineSidebar
      storiesCount={storiesCount}
      onClear={handleClear}
      onImported={handleImported}
    />
  );
}
