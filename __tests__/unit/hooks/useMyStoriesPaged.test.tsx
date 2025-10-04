/**
 * Tests for useMyStoriesPaged hook
 * 
 * This hook wraps useBufferedPagedStories to provide paginated access to user's stories
 * with delete operations.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { UserProvider } from '@/contexts/UserContext';
import useMyStoriesPaged from '@/hooks/useMyStoriesPaged';
import getClientUserId from '@/lib/getClientUserId';
import type { Story } from '@/types/story';

// Mock dependencies
jest.mock('@/lib/getClientUserId');
jest.mock('@/hooks/useBufferedPagedStories');

const mockGetClientUserId = getClientUserId as jest.MockedFunction<typeof getClientUserId>;

// Import the mocked module
const useBufferedPagedStories = require('@/hooks/useBufferedPagedStories').default as jest.Mock;

// Sample test data
const mockStories: Story[] = [
  {
    _id: 'story1',
    title: 'Test Story 1',
    description: 'Description 1',
    authorId: 'user123',
    chapters: [],
    published: true,
    createdAt: '2024-01-01',
  },
  {
    _id: 'story2',
    title: 'Test Story 2',
    description: 'Description 2',
    authorId: 'user123',
    chapters: [],
    published: false,
    createdAt: '2024-01-02',
  },
];

// Helper function to render hook with UserProvider
const renderHookWithProvider = (hookFn: () => ReturnType<typeof useMyStoriesPaged>) => {
  return renderHook(hookFn, {
    wrapper: UserProvider,
  });
};

describe('useMyStoriesPaged', () => {
  let mockRefresh: jest.Mock;
  let mockAlert: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClientUserId.mockResolvedValue('user123');
    global.fetch = jest.fn();
    mockRefresh = jest.fn();

    // Spy on window.alert
    mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => { });

    // Default mock implementation for useBufferedPagedStories
    useBufferedPagedStories.mockReturnValue({
      itemsForPage: mockStories,
      page: 1,
      setPage: jest.fn(),
      pageSize: 10,
      setPageSize: jest.fn(),
      total: 2,
      isLoading: false,
      isPrefetching: false,
      refresh: mockRefresh,
      unauthorized: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default page size of 10', () => {
      // Act
      renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(useBufferedPagedStories).toHaveBeenCalledWith(
        expect.objectContaining({
          endpoint: '/api/stories/mine',
          requestedPageSize: 10,
          batchSize: 50,
          prefetchThreshold: 1,
        })
      );
    });

    it('should accept custom page size', () => {
      // Act
      renderHookWithProvider(() => useMyStoriesPaged({ requestedPageSize: 20 }));

      // Assert
      expect(useBufferedPagedStories).toHaveBeenCalledWith(
        expect.objectContaining({
          requestedPageSize: 20,
        })
      );
    });

    it('should provide headersProvider function', () => {
      // Act
      renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      const callArgs = useBufferedPagedStories.mock.calls[0][0];
      expect(callArgs.headersProvider).toBeDefined();
      expect(typeof callArgs.headersProvider).toBe('function');
    });

    it('should return stories from buffered hook', () => {
      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.stories).toEqual(mockStories);
      expect(result.current.loading).toBe(false);
      expect(result.current.unauthorized).toBe(false);
    });
  });

  describe('headersProvider', () => {
    it('should provide x-user-id header when user is authenticated', async () => {
      // Arrange - Must set mock BEFORE rendering
      mockGetClientUserId.mockReset();
      mockGetClientUserId.mockResolvedValue('user456');

      // Act
      renderHookWithProvider(() => useMyStoriesPaged());

      // Wait for userId to be loaded in context
      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      const headersProvider = useBufferedPagedStories.mock.calls[useBufferedPagedStories.mock.calls.length - 1][0].headersProvider;
      const headers = await headersProvider();

      // Assert
      expect(headers).toEqual({ 'x-user-id': 'user456' });
    });

    it('should provide empty headers when user is not authenticated', async () => {
      // Arrange
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      renderHookWithProvider(() => useMyStoriesPaged());
      const headersProvider = useBufferedPagedStories.mock.calls[0][0].headersProvider;
      const headers = await headersProvider();

      // Assert
      expect(headers).toEqual({});
    });
  });

  describe('pagination', () => {
    it('should expose page and setPage from buffered hook', () => {
      // Arrange
      const mockSetPage = jest.fn();
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: mockStories,
        page: 2,
        setPage: mockSetPage,
        pageSize: 10,
        setPageSize: jest.fn(),
        total: 50,
        isLoading: false,
        isPrefetching: false,
        refresh: mockRefresh,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.page).toBe(2);
      expect(result.current.setPage).toBe(mockSetPage);
    });

    it('should expose pageSize and setPageSize from buffered hook', () => {
      // Arrange
      const mockSetPageSize = jest.fn();
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: mockStories,
        page: 1,
        setPage: jest.fn(),
        pageSize: 25,
        setPageSize: mockSetPageSize,
        total: 50,
        isLoading: false,
        isPrefetching: false,
        refresh: mockRefresh,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.pageSize).toBe(25);
      expect(result.current.setPageSize).toBe(mockSetPageSize);
    });

    it('should expose total from buffered hook', () => {
      // Arrange
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: mockStories,
        page: 1,
        setPage: jest.fn(),
        pageSize: 10,
        setPageSize: jest.fn(),
        total: 100,
        isLoading: false,
        isPrefetching: false,
        refresh: mockRefresh,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.total).toBe(100);
    });

    it('should expose isPrefetching from buffered hook', () => {
      // Arrange
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: mockStories,
        page: 1,
        setPage: jest.fn(),
        pageSize: 10,
        setPageSize: jest.fn(),
        total: 50,
        isLoading: false,
        isPrefetching: true,
        refresh: mockRefresh,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.isPrefetching).toBe(true);
    });
  });

  describe('refresh', () => {
    it('should call refresh from buffered hook', async () => {
      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());
      await result.current.refresh();

      // Assert
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteStory', () => {
    it('should delete a story successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Wait for userId to be available
      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });

      // Give time for the context to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stories/story1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'x-user-id': 'user123' },
        })
      );
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should handle delete failure', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Wait for userId to be available
      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(false);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should handle network error during delete', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());
      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(false);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should show alert when user is not authenticated', async () => {
      // Arrange
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());
      const success = await result.current.deleteStory('story1');

      // Assert
      expect(success).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith('You must be signed in to delete a story');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should delete all stories successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Wait for userId to be available
      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });
      await new Promise(resolve => setTimeout(resolve, 100));

      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stories/mine',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'x-user-id': 'user123' },
        })
      );
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should handle deleteAll failure', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(false);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should handle network error during deleteAll', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(false);
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should show alert when user is not authenticated', async () => {
      // Arrange
      mockGetClientUserId.mockResolvedValue(null);

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());
      const success = await result.current.deleteAll();

      // Assert
      expect(success).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith('You must be signed in to perform this action');
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  describe('loading states', () => {
    it('should expose loading state from buffered hook', () => {
      // Arrange
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: [],
        page: 1,
        setPage: jest.fn(),
        pageSize: 10,
        setPageSize: jest.fn(),
        total: 0,
        isLoading: true,
        isPrefetching: false,
        refresh: mockRefresh,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.loading).toBe(true);
    });

    it('should expose unauthorized state from buffered hook', () => {
      // Arrange
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: [],
        page: 1,
        setPage: jest.fn(),
        pageSize: 10,
        setPageSize: jest.fn(),
        total: 0,
        isLoading: false,
        isPrefetching: false,
        refresh: mockRefresh,
        unauthorized: true,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.unauthorized).toBe(true);
    });

    it('should handle undefined unauthorized state', () => {
      // Arrange
      useBufferedPagedStories.mockReturnValue({
        itemsForPage: [],
        page: 1,
        setPage: jest.fn(),
        pageSize: 10,
        setPageSize: jest.fn(),
        total: 0,
        isLoading: false,
        isPrefetching: false,
        refresh: mockRefresh,
        unauthorized: undefined,
      });

      // Act
      const { result } = renderHookWithProvider(() => useMyStoriesPaged());

      // Assert
      expect(result.current.unauthorized).toBe(false);
    });
  });
});
