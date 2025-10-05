/**
 * Tests for StoryCard component
 * 
 * Card component for displaying story information with different views (grid/list),
 * delete functionality, and bravo button integration.
 */

import { screen, waitFor } from '@testing-library/react';
import { render } from '../../setup/test-utils';
import userEvent from '@testing-library/user-event';
import StoryCard from '@/components/Story/StoryCard';
import getClientUserId from '@/lib/getClientUserId';
import type { Story } from '@/types/story';

// Mock dependencies
jest.mock('@/lib/getClientUserId');
jest.mock('@/components/BravoButton', () => {
  return function MockBravoButton({ storyId, initialBravos, onToggle, braved }: any) {
    return (
      <button
        data-testid="bravo-button"
        data-story-id={storyId}
        data-bravos={initialBravos}
        data-braved={braved}
        onClick={() => onToggle?.(initialBravos + 1, !braved)}
      >
        Bravo {initialBravos}
      </button>
    );
  };
});

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockGetClientUserId = getClientUserId as jest.MockedFunction<typeof getClientUserId>;

// Sample test data
const mockStory: Story = {
  _id: 'story123',
  title: 'Test Story',
  description: 'This is a test story description',
  chapters: [
    { title: 'Chapter 1', content: 'Content 1', order: 1 },
    { title: 'Chapter 2', content: 'Content 2', order: 2 },
  ],
  chapterCount: 2,
  published: true,
  bravos: ['user1', 'user2'],
  createdAt: '2024-01-15T10:00:00.000Z',
};

describe('StoryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClientUserId.mockResolvedValue('user123');
  });

  describe('Grid view (default)', () => {
    it('should render story title as link', () => {
      render(<StoryCard story={mockStory} />);

      const titleLink = screen.getByRole('link', { name: mockStory.title });
      expect(titleLink).toBeInTheDocument();
      expect(titleLink).toHaveAttribute('href', `/story/${mockStory._id}`);
    });

    it('should render story description', () => {
      render(<StoryCard story={mockStory} />);

      expect(screen.getByText(mockStory.description)).toBeInTheDocument();
    });

    it('should display chapter count', () => {
      render(<StoryCard story={mockStory} />);

      expect(screen.getByText('2 chapters')).toBeInTheDocument();
    });

    it('should display singular chapter text when count is 1', () => {
      const singleChapterStory = { ...mockStory, chapterCount: 1, chapters: [mockStory.chapters[0]] };
      render(<StoryCard story={singleChapterStory} />);

      expect(screen.getByText('1 chapter')).toBeInTheDocument();
    });

    it('should display creation date', () => {
      render(<StoryCard story={mockStory} />);

      // Date format depends on locale, just check "Created" text exists
      expect(screen.getByText(/Created/i)).toBeInTheDocument();
    });

    it('should render BravoButton with correct props', () => {
      render(<StoryCard story={mockStory} />);

      const bravoButton = screen.getByTestId('bravo-button');
      expect(bravoButton).toHaveAttribute('data-story-id', mockStory._id);
      expect(bravoButton).toHaveAttribute('data-bravos', '2');
    });

    it('should show published indicator (green border)', () => {
      const { container } = render(<StoryCard story={mockStory} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-green-400');
    });

    it('should show unpublished indicator (yellow border)', () => {
      const unpublishedStory = { ...mockStory, published: false };
      const { container } = render(<StoryCard story={unpublishedStory} />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-yellow-400');
    });
  });

  describe('List view', () => {
    it('should render in list layout when view="list"', () => {
      const { container } = render(<StoryCard story={mockStory} view="list" />);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('flex');
      expect(screen.getByText(mockStory.title)).toBeInTheDocument();
    });

    it('should display all story information in list view', () => {
      render(<StoryCard story={mockStory} view="list" />);

      expect(screen.getByText(mockStory.title)).toBeInTheDocument();
      expect(screen.getByText(mockStory.description)).toBeInTheDocument();
      expect(screen.getByText('2 chapters')).toBeInTheDocument();
    });
  });

  describe('Delete functionality', () => {
    it('should show delete button when showDelete is true', () => {
      const onDelete = jest.fn();
      render(<StoryCard story={mockStory} showDelete onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete story/i });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should not show delete button by default', () => {
      render(<StoryCard story={mockStory} />);

      const deleteButton = screen.queryByRole('button', { name: /delete story/i });
      expect(deleteButton).not.toBeInTheDocument();
    });

    it('should call onDelete with story ID when delete button clicked', async () => {
      const onDelete = jest.fn();
      const user = userEvent.setup();

      render(<StoryCard story={mockStory} showDelete onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete story/i });
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockStory._id);
    });

    it('should show preview link when showDelete is true', () => {
      const onDelete = jest.fn();
      render(<StoryCard story={mockStory} showDelete onDelete={onDelete} />);

      const previewLink = screen.getByRole('link', { name: /preview story/i });
      expect(previewLink).toBeInTheDocument();
      expect(previewLink).toHaveAttribute('href', `/story/${mockStory._id}`);
      expect(previewLink).toHaveAttribute('target', '_blank');
    });

    it('should link to edit page when showDelete is true', () => {
      const onDelete = jest.fn();
      render(<StoryCard story={mockStory} showDelete onDelete={onDelete} />);

      const titleLink = screen.getByRole('link', { name: mockStory.title });
      expect(titleLink).toHaveAttribute('href', `/story/${mockStory._id}/edit`);
    });
  });

  describe('"Yours" badge', () => {
    it('should show "Yours" badge when isMine is true', () => {
      render(<StoryCard story={mockStory} isMine />);

      expect(screen.getByText('Yours')).toBeInTheDocument();
    });

    it('should not show "Yours" badge by default', () => {
      render(<StoryCard story={mockStory} />);

      expect(screen.queryByText('Yours')).not.toBeInTheDocument();
    });

    it('should hide "Yours" badge when showYoursBadge is false', () => {
      render(<StoryCard story={mockStory} isMine showYoursBadge={false} />);

      expect(screen.queryByText('Yours')).not.toBeInTheDocument();
    });

    it('should show "Yours" badge in both grid and list views', () => {
      const { rerender } = render(<StoryCard story={mockStory} isMine view="grid" />);
      expect(screen.getByText('Yours')).toBeInTheDocument();

      rerender(<StoryCard story={mockStory} isMine view="list" />);
      expect(screen.getByText('Yours')).toBeInTheDocument();
    });
  });

  describe('Bravo integration', () => {
    it('should initialize braved state from getClientUserId', async () => {
      const storyWithBravos = { ...mockStory, bravos: ['user123', 'user456'] };
      mockGetClientUserId.mockResolvedValue('user123');

      render(<StoryCard story={storyWithBravos} />);

      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });
    });

    it('should update bravo count when BravoButton toggles', async () => {
      render(<StoryCard story={mockStory} />);

      const bravoButton = screen.getByTestId('bravo-button');
      await userEvent.click(bravoButton);

      // After toggle, count should update
      await waitFor(() => {
        expect(bravoButton).toHaveAttribute('data-bravos', '3');
      });
    });

    it('should handle null user ID for bravo state', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      render(<StoryCard story={mockStory} />);

      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });

      // Should still render without errors
      expect(screen.getByTestId('bravo-button')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle story without chapters array', () => {
      const noChaptersStory = { ...mockStory, chapters: [], chapterCount: undefined };
      render(<StoryCard story={noChaptersStory} />);

      expect(screen.getByText('0 chapters')).toBeInTheDocument();
    });

    it('should handle story without bravos array', () => {
      const noBravosStory = { ...mockStory, bravos: undefined };
      render(<StoryCard story={noBravosStory} />);

      const bravoButton = screen.getByTestId('bravo-button');
      expect(bravoButton).toHaveAttribute('data-bravos', '0');
    });

    it('should handle story without createdAt', () => {
      const noDateStory = { ...mockStory, createdAt: undefined };
      render(<StoryCard story={noDateStory} />);

      expect(screen.getByText(/Unknown/i)).toBeInTheDocument();
    });

    it('should use chapterCount over chapters.length when available', () => {
      const storyWithCount = {
        ...mockStory,
        chapterCount: 5,
        chapters: [mockStory.chapters[0]], // Only 1 in array but count is 5
      };
      render(<StoryCard story={storyWithCount} />);

      expect(screen.getByText('5 chapters')).toBeInTheDocument();
    });

    it('should handle unmount during async getUserId call', async () => {
      mockGetClientUserId.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('user123'), 100))
      );

      const { unmount } = render(<StoryCard story={mockStory} />);

      // Unmount before promise resolves
      unmount();

      // Wait a bit and ensure no errors
      await new Promise(resolve => setTimeout(resolve, 150));
    });
  });

  describe('Accessibility', () => {
    it('should have accessible delete button', () => {
      const onDelete = jest.fn();
      render(<StoryCard story={mockStory} showDelete onDelete={onDelete} />);

      const deleteButton = screen.getByRole('button', { name: /delete story/i });
      expect(deleteButton).toHaveAccessibleName();
      expect(deleteButton).toHaveAttribute('aria-label', 'Delete story');
    });

    it('should have accessible preview link', () => {
      const onDelete = jest.fn();
      render(<StoryCard story={mockStory} showDelete onDelete={onDelete} />);

      const previewLink = screen.getByRole('link', { name: /preview story/i });
      expect(previewLink).toHaveAccessibleName();
      expect(previewLink).toHaveAttribute('aria-label', 'Preview story');
    });

    it('should have proper link structure for screen readers', () => {
      render(<StoryCard story={mockStory} />);

      const titleLink = screen.getByRole('link', { name: mockStory.title });
      expect(titleLink).toBeInTheDocument();
    });
  });
});
