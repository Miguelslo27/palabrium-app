/**
 * Mock for @clerk/nextjs client-side hooks
 * This file mocks the Clerk authentication hooks for testing
 */

// Mock user data
export const mockUser = {
  id: 'user_test123',
  firstName: 'Test',
  lastName: 'User',
  fullName: 'Test User',
  imageUrl: 'https://example.com/avatar.jpg',
  primaryEmailAddress: {
    emailAddress: 'test@example.com',
  },
  emailAddresses: [
    {
      emailAddress: 'test@example.com',
    },
  ],
};

// Mock authenticated state
export const mockUseUser = {
  isSignedIn: true,
  isLoaded: true,
  user: mockUser,
};

// Mock unauthenticated state
export const mockUseUserUnauthenticated = {
  isSignedIn: false,
  isLoaded: true,
  user: null,
};

// Mock loading state
export const mockUseUserLoading = {
  isSignedIn: false,
  isLoaded: false,
  user: null,
};

// Mock useAuth hook
export const mockUseAuth = {
  isSignedIn: true,
  isLoaded: true,
  userId: 'user_test123',
  sessionId: 'sess_test123',
  signOut: jest.fn().mockResolvedValue(undefined),
  getToken: jest.fn().mockResolvedValue('mock_token'),
};

// Mock useClerk hook
export const mockUseClerk = {
  signOut: jest.fn().mockResolvedValue(undefined),
  redirectToSignIn: jest.fn(),
  redirectToSignUp: jest.fn(),
  openSignIn: jest.fn(),
  openSignUp: jest.fn(),
  closeSignIn: jest.fn(),
  closeSignUp: jest.fn(),
};

// Default mock implementation for @clerk/nextjs
export const clerkClientMocks = {
  useUser: jest.fn(() => mockUseUser),
  useAuth: jest.fn(() => mockUseAuth),
  useClerk: jest.fn(() => mockUseClerk),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
  SignIn: () => null,
  SignUp: () => null,
  UserButton: () => null,
  SignedIn: ({ children }: { children: React.ReactNode }) => children,
  SignedOut: () => null,
};

// Helper function to set authenticated state
export const setMockUserAuthenticated = (authenticated: boolean = true) => {
  if (authenticated) {
    clerkClientMocks.useUser.mockReturnValue(mockUseUser as any);
    clerkClientMocks.useAuth.mockReturnValue(mockUseAuth as any);
  } else {
    clerkClientMocks.useUser.mockReturnValue(mockUseUserUnauthenticated as any);
    clerkClientMocks.useAuth.mockReturnValue({
      ...mockUseAuth,
      isSignedIn: false,
      userId: null as any,
      sessionId: null as any,
    });
  }
};

// Helper function to set loading state
export const setMockUserLoading = (loading: boolean = true) => {
  if (loading) {
    clerkClientMocks.useUser.mockReturnValue(mockUseUserLoading as any);
    clerkClientMocks.useAuth.mockReturnValue({
      ...mockUseAuth,
      isLoaded: false,
    });
  } else {
    clerkClientMocks.useUser.mockReturnValue(mockUseUser as any);
    clerkClientMocks.useAuth.mockReturnValue(mockUseAuth as any);
  }
};

// Reset all mocks
export const resetClerkMocks = () => {
  Object.values(clerkClientMocks).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
  setMockUserAuthenticated(true);
};
