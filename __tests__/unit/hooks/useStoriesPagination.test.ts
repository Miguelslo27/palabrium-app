import { act, renderHook } from '../../setup/test-utils';
import { useStoriesPagination } from '@/hooks/useStoriesPagination';
import type { Story } from '@/types/story';

const makeStories = (count: number): Story[] =>
  Array.from({ length: count }, (_, index) => ({
    _id: `story-${index + 1}`,
    title: `Story ${index + 1}`,
    description: `Description ${index + 1}`,
    chapters: [],
  }));

describe('useStoriesPagination', () => {
  it('should paginate client-side stories by default', () => {
    const stories = makeStories(25);
    const { result } = renderHook(() =>
      useStoriesPagination({ items: stories, initialPage: 1, pageSize: 10 }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.items).toHaveLength(10);
    expect(result.current.items[0]._id).toBe('story-1');
  });

  it('should update page state when setPage is called uncontrolled', () => {
    const stories = makeStories(25);
    const { result } = renderHook(() =>
      useStoriesPagination({ items: stories, initialPage: 1, pageSize: 10 }),
    );

    act(() => {
      result.current.setPage(2);
    });

    expect(result.current.page).toBe(2);
    expect(result.current.items[0]._id).toBe('story-11');
  });

  it('should clamp page number within valid range', () => {
    const stories = makeStories(5);
    const { result } = renderHook(() =>
      useStoriesPagination({ items: stories, initialPage: 10, pageSize: 10 }),
    );

    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it('should respect controlled page and invoke onPageChange when provided', () => {
    const stories = makeStories(30);
    const onPageChange = jest.fn();
    const { result, rerender } = renderHook(
      ({ page }: { page: number }) =>
        useStoriesPagination({
          items: stories,
          pageSize: 10,
          controlledPage: page,
          onPageChange,
        }),
      { initialProps: { page: 1 } },
    );

    expect(result.current.page).toBe(1);

    act(() => {
      result.current.setPage(3);
    });

    expect(onPageChange).toHaveBeenCalledWith(3);

    rerender({ page: 3 });
    expect(result.current.page).toBe(3);
    expect(result.current.items[0]._id).toBe('story-21');
  });

  it('should handle server-paged mode without slicing items', () => {
    const stories = makeStories(5);
    const onPageChange = jest.fn();
    const onPageSizeChange = jest.fn();

    const { result } = renderHook(() =>
      useStoriesPagination({
        items: stories,
        serverPaged: true,
        totalItems: 50,
        pageSize: 5,
        controlledPage: 4,
        onPageChange,
        onPageSizeChange,
      }),
    );

    expect(result.current.items).toHaveLength(5);
    expect(result.current.totalItems).toBe(50);
    expect(result.current.totalPages).toBe(10);

    act(() => {
      result.current.setPage(5);
      result.current.setPageSize(20);
    });

    expect(onPageChange).toHaveBeenCalledWith(5);
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('should reset to page 1 when page size changes in uncontrolled mode', () => {
    const stories = makeStories(40);
    const { result } = renderHook(() =>
      useStoriesPagination({ items: stories, initialPage: 2, pageSize: 10 }),
    );

    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setPageSize(5);
    });

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(5);
  });
});
