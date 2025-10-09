'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface StoriesExploreSearchClientProps {
  initialQuery: string;
  limit: number;
}

export default function StoriesExploreSearchClient({
  initialQuery,
  limit,
}: StoriesExploreSearchClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value: string) => {
    setQuery(value);
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('limit', limit.toString());
      if (value) {
        params.set('q', value);
      }
      router.push(`/stories?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <input
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search stories..."
        aria-label="Search stories"
        className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60"
        disabled={isPending}
      />
    </div>
  );
}
