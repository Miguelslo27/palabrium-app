"use client";

import { useCallback, useEffect, useState } from 'react';

export type StoriesView = 'grid' | 'list';

const STORAGE_KEY = 'stories.view';

export function useStoriesViewPreference(defaultView: StoriesView = 'grid'): [StoriesView, (view: StoriesView) => void] {
  const [view, setViewState] = useState<StoriesView>(defaultView);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'grid' || stored === 'list') {
        setViewState(stored);
      }
    } catch {
      // Ignore storage access errors (e.g. SSR or privacy mode)
    }
  }, [defaultView]);

  const setView = useCallback((next: StoriesView) => {
    setViewState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore storage write failures
    }
  }, []);

  return [view, setView];
}
