"use client";

import { act, renderHook } from '../../setup/test-utils';
import { useStoriesViewPreference } from '@/hooks/useStoriesViewPreference';

describe('useStoriesViewPreference', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should default to grid when no preference stored', () => {
    const { result } = renderHook(() => useStoriesViewPreference());
    expect(result.current[0]).toBe('grid');
  });

  it('should read initial value from localStorage', () => {
    window.localStorage.setItem('stories.view', 'list');
    const { result } = renderHook(() => useStoriesViewPreference());
    expect(result.current[0]).toBe('list');
  });

  it('should persist changes to localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { result } = renderHook(() => useStoriesViewPreference());

    act(() => {
      result.current[1]('list');
    });

    expect(result.current[0]).toBe('list');
    expect(setItemSpy).toHaveBeenCalledWith('stories.view', 'list');
  });

  it('should ignore invalid stored values and fallback to default', () => {
    window.localStorage.setItem('stories.view', 'invalid');
    const { result } = renderHook(() => useStoriesViewPreference('list'));
    expect(result.current[0]).toBe('list');
  });
});
