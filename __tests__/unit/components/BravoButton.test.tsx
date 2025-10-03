/**
 * Tests for BravoButton component
 * 
 * This component handles the "Bravo" interaction for stories.
 * It can work in controlled or uncontrolled mode.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BravoButton from '@/components/BravoButton';
import getClientUserId from '@/lib/getClientUserId';
import { mockFetchSuccess, mockFetchError, mockFetchNetworkError, resetFetchMock } from '../../mocks/fetch';

// Mock dependencies
jest.mock('@/lib/getClientUserId');

const mockGetClientUserId = getClientUserId as jest.MockedFunction<typeof getClientUserId>;

describe('BravoButton', () => {
  beforeEach(() => {
    // Setup default fetch mock
    mockFetchSuccess({ bravos: 42, braved: true });

    // Mock alert
    jest.spyOn(window, 'alert').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetFetchMock();
  });

  describe('initialization', () => {
    it('should render with initial bravo count', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Bravo \(10\)/)).toBeInTheDocument();
      });
    });

    it('should show "Bravo" text when user is not logged in', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      render(
        <BravoButton
          storyId="story1"
          initialBravos={5}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Bravo')).toBeInTheDocument();
        expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
      });
    });

    it('should initialize as braved when user is in userBravos array', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={['user123', 'user456']}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-yellow-500');
        expect(screen.getByText(/Bravos \(10\)/)).toBeInTheDocument();
      });
    });

    it('should initialize as not braved when user is not in userBravos array', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={['user456', 'user789']}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-gray-200');
        expect(screen.getByText(/Bravo \(10\)/)).toBeInTheDocument();
      });
    });
  });

  describe('button state', () => {
    it('should be disabled when user is not logged in', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      render(
        <BravoButton
          storyId="story1"
          initialBravos={5}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });

    it('should be enabled when user is logged in', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={5}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).not.toBeDisabled();
        expect(button).not.toHaveClass('cursor-not-allowed');
      });
    });
  });

  describe('bravo toggle', () => {
    it('should call API when button is clicked', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/stories/story1/bravo',
        expect.objectContaining({
          method: 'POST',
          headers: { 'x-user-id': 'user123' },
        })
      );
    });

    it('should update bravo count after successful toggle', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      // Mock two different responses: initial and after click
      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Bravo \(10\)/)).toBeInTheDocument();
      });

      // Update mock for the click
      mockFetchSuccess({ bravos: 11, braved: true });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Bravos \(11\)/)).toBeInTheDocument();
      });
    });

    it('should change button style after bravo toggle', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-gray-200');
      });

      mockFetchSuccess({ bravos: 11, braved: true });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('bg-yellow-500');
      });
    });

    it('should call onToggle callback when provided', async () => {
      const user = userEvent.setup();
      const onToggleMock = jest.fn();
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
          onToggle={onToggleMock}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
      });

      mockFetchSuccess({ bravos: 11, braved: true });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(onToggleMock).toHaveBeenCalledWith(11, true);
      });
    });

    it('should not call API when button is disabled (not logged in)', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
      });

      // Button is disabled, fetch should not be called
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('should use controlled braved prop when provided', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      const { rerender } = render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
          braved={false}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-gray-200');
        expect(screen.getByText(/Bravo \(10\)/)).toBeInTheDocument();
      });

      // Change controlled prop
      rerender(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
          braved={true}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-yellow-500');
        expect(screen.getByText(/Bravos \(10\)/)).toBeInTheDocument();
      });
    });

    it('should not update internal state in controlled mode after toggle', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
          braved={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
      });

      mockFetchSuccess({ bravos: 11, braved: true });

      const button = screen.getByRole('button');
      await user.click(button);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Button should still show not-braved state since parent didn't update prop
      expect(button).toHaveClass('bg-gray-200');
    });
  });

  describe('error handling', () => {
    it('should show alert on fetch failure', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert');
      mockGetClientUserId.mockResolvedValue('user123');
      mockFetchNetworkError('Network error');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith('Error al enviar Bravo. Revisa la consola.');
      });
    });

    it('should show alert on non-ok response', async () => {
      const user = userEvent.setup();
      const alertMock = jest.spyOn(window, 'alert');
      mockGetClientUserId.mockResolvedValue('user123');
      mockFetchError(401, 'Unauthorized');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalled();
      });
    });

    it('should not update UI on server error', async () => {
      const user = userEvent.setup();
      mockGetClientUserId.mockResolvedValue('user123');
      mockFetchError(500, 'Server error');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Bravo \(10\)/)).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });

      // Count should stay the same (not updated due to error)
      expect(screen.getByText(/Bravo \(10\)/)).toBeInTheDocument();
    });
  });

  describe('component lifecycle', () => {
    it('should handle unmount during getUserId call', async () => {
      let resolveGetUserId: (value: string | null) => void;
      const getUserIdPromise = new Promise<string | null>((resolve) => {
        resolveGetUserId = resolve;
      });
      mockGetClientUserId.mockReturnValue(getUserIdPromise);

      const { unmount } = render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      unmount();

      // Resolve after unmount - should not cause issues
      resolveGetUserId!('user123');

      await waitFor(() => {
        expect(mockGetClientUserId).toHaveBeenCalled();
      });

      // No error should be thrown
    });

    it('should update when userBravos prop changes', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      const { rerender } = render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-gray-200');
      });

      // Add user to bravos
      rerender(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={['user123']}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-yellow-500');
      });
    });
  });

  describe('styling', () => {
    it('should apply correct classes when braved', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={['user123']}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('px-4', 'py-2', 'rounded', 'bg-yellow-500', 'text-white');
      });
    });

    it('should apply correct classes when not braved', async () => {
      mockGetClientUserId.mockResolvedValue('user123');

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('px-4', 'py-2', 'rounded', 'bg-gray-200');
      });
    });

    it('should apply disabled styles when not logged in', async () => {
      mockGetClientUserId.mockResolvedValue(null);

      render(
        <BravoButton
          storyId="story1"
          initialBravos={10}
          userBravos={[]}
        />
      );

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
      });
    });
  });
});
