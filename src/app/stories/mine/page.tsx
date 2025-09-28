'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import StoryList from '@/components/StoryList';
import useMyStories from '@/hooks/useMyStories';
import EditorLayout from '@/components/Editor/EditorLayout';
import Button from '@/components/Editor/Shared/Button';
import MineSidebar from '@/components/Stories/MineSidebar';
import PageHeader from '@/components/Common/PageHeader';
import ContentCard from '@/components/Common/ContentCard';
import Hero from '@/components/Common/Hero';

export default function MyStories() {
  const { stories, loading, unauthorized, deleteStory, deleteAll } = useMyStories();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    const ok = await deleteStory(id);
    if (!ok) alert('Failed to delete story');
  };

  return (
    <EditorLayout>
      <Navbar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader title="My Stories">
          <Link href="/story/new">
            <Button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded text-sm">Create New Story</Button>
          </Link>
        </PageHeader>

        <div className="flex-1 flex overflow-auto min-h-0">
          <MineSidebar
            storiesCount={stories.length}
            onClear={async () => {
              if (!confirm('Delete ALL your stories? This cannot be undone.')) return;
              const ok = await deleteAll();
              if (ok) {
                alert('Deleted all stories');
              } else {
                alert('Failed to delete stories');
              }
            }}
          />

          <main className="flex-1 p-6 overflow-y-auto">
            <Hero gradientClass="bg-gradient-to-r from-green-50 to-white" borderClass="border-green-100">
              <h2 className="text-2xl font-semibold text-gray-900">Your personal workspace</h2>
              <p className="text-sm text-gray-600 mt-2">Draft and manage your stories here. Only you can see them until you publish.</p>
            </Hero>
            <ContentCard>
              <div className="p-6 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-gray-600">Loading your stories…</div>
                ) : unauthorized ? (
                  <div className="text-red-600">You must be signed in to see your stories.</div>
                ) : stories.length === 0 ? (
                  <div className="text-gray-600">You have no stories yet. <Link href="/story/new" className="text-blue-600">Create one</Link>.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StoryList stories={stories} onDelete={handleDelete} allowDelete={true} />
                  </div>
                )}
              </div>
            </ContentCard>
          </main>
        </div>
      </div>
    </EditorLayout>
  );
}