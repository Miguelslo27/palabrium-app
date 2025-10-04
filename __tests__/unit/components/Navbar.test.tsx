/**
 * Tests for Navbar component
 * 
 * Navigation bar with Clerk authentication integration.
 * Shows different navigation options based on user authentication status.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '@/components/Navbar';

// Mock Clerk hooks
const mockSignOut = jest.fn();
const mockUseUser = jest.fn();
const mockUseClerk = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useUser: () => mockUseUser(),
  useClerk: () => mockUseClerk(),
}));

// Mock Next.js components
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClerk.mockReturnValue({ signOut: mockSignOut });
  });

  describe('Loading state', () => {
    it('should show loading skeleton when not loaded', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: false });

      render(<Navbar />);

      // Should show skeleton
      const skeleton = screen.getByText('Palabrium').parentElement?.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });

    it('should always show Palabrium logo', () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: false });

      render(<Navbar />);

      expect(screen.getByText('Palabrium')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated state', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true });
    });

    it('should show Explore link', async () => {
      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      });
    });

    it('should show Sign In link', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const signInLink = screen.getByRole('link', { name: /sign in/i });
        expect(signInLink).toBeInTheDocument();
        expect(signInLink).toHaveAttribute('href', '/sign-in');
      });
    });

    it('should show Sign Up link', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const signUpLink = screen.getByRole('link', { name: /sign up/i });
        expect(signUpLink).toBeInTheDocument();
        expect(signUpLink).toHaveAttribute('href', '/sign-up');
      });
    });

    it('should not show authenticated-only links', async () => {
      render(<Navbar />);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /my stories/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
      });
    });

    it('should not show user avatar', async () => {
      render(<Navbar />);

      await waitFor(() => {
        expect(screen.queryByAltText(/picture of the author/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Authenticated state', () => {
    const mockUser = {
      id: 'user123',
      imageUrl: 'https://example.com/avatar.jpg',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
    };

    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: mockUser, isLoaded: true });
    });

    it('should show My Stories link', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const myStoriesLink = screen.getByRole('link', { name: /my stories/i });
        expect(myStoriesLink).toBeInTheDocument();
        expect(myStoriesLink).toHaveAttribute('href', '/stories/mine');
      });
    });

    it('should show Explore link', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const exploreLink = screen.getByRole('link', { name: /explore/i });
        expect(exploreLink).toBeInTheDocument();
        expect(exploreLink).toHaveAttribute('href', '/stories');
      });
    });

    it('should show Logout button', async () => {
      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should show user avatar', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const avatar = screen.getByAltText(/picture of the author/i);
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src', mockUser.imageUrl);
      });
    });

    it('should not show Sign In/Sign Up links', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        const linkTexts = links.map(link => link.textContent);
        expect(linkTexts).not.toContain('Sign In');
        expect(linkTexts).not.toContain('Sign Up');
      });
    });

    it('should call signOut with redirect when logout clicked', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: '/' });
    });
  });

  describe('Logo and branding', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true });
    });

    it('should render Palabrium logo as link to home', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const logoLink = screen.getByRole('link', { name: /palabrium/i });
        expect(logoLink).toBeInTheDocument();
        expect(logoLink).toHaveAttribute('href', '/');
      });
    });

    it('should style logo appropriately', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const logoLink = screen.getByRole('link', { name: /palabrium/i });
        expect(logoLink).toHaveClass('text-2xl', 'font-bold', 'hover:underline');
      });
    });
  });

  describe('Layout and styling', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true });
    });

    it('should render as header element', async () => {
      const { container } = render(<Navbar />);

      await waitFor(() => {
        const header = container.querySelector('header');
        expect(header).toBeInTheDocument();
      });
    });

    it('should have proper header styling', async () => {
      const { container } = render(<Navbar />);

      await waitFor(() => {
        const header = container.querySelector('header');
        expect(header).toHaveClass('bg-gray-800', 'text-white', 'shadow');
      });
    });

    it('should have navigation element', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const nav = screen.getByRole('navigation');
        expect(nav).toBeInTheDocument();
      });
    });
  });

  describe('Hydration handling', () => {
    it('should handle client-side hydration correctly', async () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true });

      render(<Navbar />);

      // Wait for mounted state and verify content is shown
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
      });
    });

    it('should show loading state until both mounted and loaded', async () => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: false });

      const { container } = render(<Navbar />);

      // Should show skeleton when not loaded
      const skeleton = container.querySelector('.animate-pulse');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ user: null, isLoaded: true });
    });

    it('should have accessible navigation links', async () => {
      render(<Navbar />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).toHaveAccessibleName();
        });
      });
    });

    it('should have accessible logout button when authenticated', async () => {
      const mockUser = {
        id: 'user123',
        imageUrl: 'https://example.com/avatar.jpg',
      };
      mockUseUser.mockReturnValue({ user: mockUser, isLoaded: true });

      render(<Navbar />);

      await waitFor(() => {
        const logoutButton = screen.getByRole('button', { name: /logout/i });
        expect(logoutButton).toHaveAccessibleName();
      });
    });

    it('should have proper alt text for avatar', async () => {
      const mockUser = {
        id: 'user123',
        imageUrl: 'https://example.com/avatar.jpg',
      };
      mockUseUser.mockReturnValue({ user: mockUser, isLoaded: true });

      render(<Navbar />);

      await waitFor(() => {
        const avatar = screen.getByAltText(/picture of the author/i);
        expect(avatar).toHaveAttribute('alt');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined user', async () => {
      mockUseUser.mockReturnValue({ user: undefined, isLoaded: true });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /explore/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
      });
    });

    it('should handle user without imageUrl', async () => {
      const userWithoutImage = {
        id: 'user123',
        imageUrl: '',
      };
      mockUseUser.mockReturnValue({ user: userWithoutImage, isLoaded: true });

      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });
    });

    it('should call signOut even if it might fail', async () => {
      const mockUser = { id: 'user123', imageUrl: 'https://example.com/avatar.jpg' };
      mockUseUser.mockReturnValue({ user: mockUser, isLoaded: true });

      const user = userEvent.setup();
      render(<Navbar />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      // Verify signOut was called
      expect(mockSignOut).toHaveBeenCalledWith({ redirectUrl: '/' });
    });
  });
});
