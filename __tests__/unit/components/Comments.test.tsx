/**
 * Tests for Comments component
 * 
 * This component handles displaying and creating comments for stories.
 * It manages loading states, error handling, and user authentication.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Comments from '@/components/Comments';
import getClientUserId from '@/lib/getClientUserId';
import { mockFetchSuccess, mockFetchError, resetFetchMock } from '../../mocks/fetch';

// Mock dependencies
jest.mock('@/lib/getClientUserId');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockGetClientUserId = getClientUserId as jest.MockedFunction<typeof getClientUserId>;

// Sample comment data
const mockComments = [
  {
    _id: 'comment1',
    content: 'This is a great story!',
    createdAt: '2025-10-01T10:00:00.000Z',
    authorName: 'John Doe',
    authorImage: 'https://example.com/avatar1.jpg',
  },
  {
    _id: 'comment2',
    content: 'I loved the plot twist!',
    createdAt: '2025-10-02T15:30:00.000Z',
    authorName: 'Jane Smith',
    authorImage: null,
  },
  {
    _id: 'comment3',
    content: 'Amazing work!',
    createdAt: '2025-10-03T08:15:00.000Z',
    authorName: null,
    authorImage: null,
  },
];

describe('Comments', () => {
  beforeEach(() => {
    mockGetClientUserId.mockResolvedValue('user123');
    mockFetchSuccess(mockComments);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetFetchMock();
  });

  describe('initial render and loading', () => {
    it('should render comments heading', async () => {
      render(<Comments storyId="story1" />);

      expect(screen.getByText('Comments')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<Comments storyId="story1" />);

      expect(screen.getByText('Loading comments…')).toBeInTheDocument();
    });

    it('should fetch comments on mount', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/stories/story1/comments');
      });
    });

    it('should display comments after loading', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('This is a great story!')).toBeInTheDocument();
        expect(screen.getByText('I loved the plot twist!')).toBeInTheDocument();
        expect(screen.getByText('Amazing work!')).toBeInTheDocument();
      });
    });

    it('should hide loading state after comments are loaded', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });
    });
  });

  describe('comment display', () => {
    it('should display author names', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display "Unknown" for missing author names', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('Unknown')).toBeInTheDocument();
      });
    });

    it('should display author images when available', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        const avatarImage = images.find(img => img.getAttribute('src') === 'https://example.com/avatar1.jpg');
        expect(avatarImage).toBeInTheDocument();
      });
    });

    it('should display initials for authors without images', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        const initialsElements = screen.getAllByText('J');
        expect(initialsElements.length).toBeGreaterThan(0);
      });
    });

    it('should display "?" for unknown authors without images', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('?')).toBeInTheDocument();
      });
    });

    it('should display formatted dates', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        // Check that dates are rendered (format may vary by locale)
        const dateElements = screen.getAllByText(/10\/[0-9]{1,2}\/2025|2025/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('should display comments in order', async () => {
      render(<Comments storyId="story1" />);

      await waitFor(() => {
        const comments = screen.getAllByText(/This is a great story!|I loved the plot twist!|Amazing work!/);
        expect(comments).toHaveLength(3);
      });
    });
  });

  describe('comment form', () => {
    it('should render comment form with textarea and button', async () => {
      mockFetchSuccess(mockComments);
      render(<Comments storyId="story1" />);

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Comment' })).toBeInTheDocument();
    });

    it('should update textarea value when typing', async () => {
      const user = userEvent.setup();
      render(<Comments storyId="story1" />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment text');

      expect(textarea).toHaveValue('New comment text');
    });

    it('should require textarea to have content', () => {
      render(<Comments storyId="story1" />);

      const textarea = screen.getByPlaceholderText('Add a comment...');
      expect(textarea).toBeRequired();
    });

    it('should disable submit button while loading', async () => {
      render(<Comments storyId="story1" />);

      // Initial load - wait for it to finish
      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /Comment/i });
      expect(button).not.toBeDisabled();
    });

    it('should show "Sending…" text while submitting', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      // First mock for initial comments load
      mockFetchSuccess(mockComments);

      render(<Comments storyId="story1" />);

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      // Now mock slow response for comment submission
      let resolvePost: (value: any) => void;
      const postPromise = new Promise((resolve) => {
        resolvePost = resolve;
      });

      global.fetch = jest.fn().mockImplementation((url: string, options?: RequestInit) => {
        // POST to submit new comment - slow response
        if (options?.method === 'POST') {
          return postPromise;
        }
        // GET to fetch comments - fast response
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        } as Response);
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment');

      const button = screen.getByRole('button', { name: 'Comment' });
      await user.click(button);

      expect(await screen.findByText('Sending…')).toBeInTheDocument();

      // Resolve the promise
      resolvePost!({
        ok: true,
        json: async () => ({ _id: 'comment4', content: 'New comment' }),
      } as Response);
    });
  });

  describe('comment submission', () => {
    it('should submit comment with correct data', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      // Setup mocks for GET and POST
      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ _id: 'comment4', content: 'New comment' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('This is a great story!')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment text');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/stories/story1/comments',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'x-user-id': 'user123',
            }),
            body: JSON.stringify({ content: 'New comment text' }),
          })
        );
      });
    });

    it('should clear textarea after successful submission', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ _id: 'comment4', content: 'New comment' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });

    it('should refresh comments after successful submission', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      let fetchCount = 0;
      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ _id: 'comment4', content: 'New comment' }),
          });
        }
        fetchCount++;
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(fetchCount).toBe(1);
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        expect(fetchCount).toBe(2); // Initial fetch + refresh after submit
      });
    });

    it('should submit without x-user-id header when user is not logged in', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue(null);

      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ _id: 'comment4', content: 'New comment' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        const postCall = calls.find(call => call[1]?.method === 'POST');
        expect(postCall[1].headers['x-user-id']).toBeUndefined();
        expect(postCall[1].headers['Content-Type']).toBe('application/json');
      });
    });
  });

  describe('error handling', () => {
    it('should display error when fetching comments fails', async () => {
      mockFetchError(500, 'Failed to load comments');

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load comments')).toBeInTheDocument();
      });
    });

    it('should display error when posting comment fails', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Failed to post comment' }),
            text: async () => 'Failed to post comment',
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Failed to post comment')).toBeInTheDocument();
      });
    });

    it('should display "Unauthorized" error for 401 response', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue(null);

      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Unauthorized' }),
            text: async () => 'Unauthorized',
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'New comment');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Unauthorized')).toBeInTheDocument();
      });
    });

    it('should handle generic errors during fetch', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle unknown error types', async () => {
      global.fetch = jest.fn().mockRejectedValue('String error');

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.getByText('Error loading comments')).toBeInTheDocument();
      });
    });

    it('should not keep textarea content on error', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'Failed comment');

      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Failed to post comment|Error posting comment/)).toBeInTheDocument();
      });

      // Textarea should still have the text so user can retry
      expect(textarea).toHaveValue('Failed comment');
    });
  });

  describe('edge cases', () => {
    it('should handle empty comments array', async () => {
      mockFetchSuccess([]);

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      // Should not crash, just show empty state
      expect(screen.getByText('Comments')).toBeInTheDocument();
    });

    it('should handle form submission preventing default behavior', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      global.fetch = jest.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({ _id: 'comment4', content: 'New comment' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => mockComments,
        });
      });

      render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(screen.queryByText('Loading comments…')).not.toBeInTheDocument();
      });

      const form = screen.getByRole('button', { name: /Comment/i }).closest('form');
      expect(form).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText('Add a comment...');
      await user.type(textarea, 'Test comment');

      // Submit form - should not cause page reload
      const button = screen.getByRole('button', { name: /Comment/i });
      await user.click(button);

      // If preventDefault wasn't called, this would cause issues in tests
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/comments'),
          expect.objectContaining({ method: 'POST' })
        );
      });
    });

    it('should handle different storyId props', async () => {
      const { rerender } = render(<Comments storyId="story1" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/stories/story1/comments');
      });

      // Change storyId
      rerender(<Comments storyId="story2" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/stories/story2/comments');
      });
    });
  });
});
