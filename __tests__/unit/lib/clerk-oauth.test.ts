/**
 * Tests for clerk-oauth module
 * 
 * This module handles OAuth authentication flows for sign up and sign in
 * using Clerk's client SDK.
 */

describe('clerk-oauth', () => {
  let clerkOAuthModule: any;
  let mockClerkClient: any;
  let mockAuthenticateWithRedirect: jest.Mock;

  beforeEach(() => {
    // Clear module cache
    jest.resetModules();

    // Setup mock authenticateWithRedirect
    mockAuthenticateWithRedirect = jest.fn().mockResolvedValue(undefined);

    // Setup default mock Clerk client
    mockClerkClient = {
      load: jest.fn().mockResolvedValue(undefined),
      signUp: {
        authenticateWithRedirect: mockAuthenticateWithRedirect,
      },
      signIn: {
        authenticateWithRedirect: mockAuthenticateWithRedirect,
      },
    };

    // Mock clerk-client module
    jest.doMock('@/lib/clerk-client', () => ({
      __esModule: true,
      default: jest.fn(() => mockClerkClient),
    }));

    // Import module after mocking
    clerkOAuthModule = require('@/lib/clerk-oauth');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('startOAuth', () => {
    describe('signUp mode', () => {
      it('should call load on Clerk client', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signUp', 'oauth_google');

        // Assert
        expect(mockClerkClient.load).toHaveBeenCalledTimes(1);
      });

      it('should use signUp API for oauth', async () => {
        // Arrange
        const strategy = 'oauth_google';
        const redirectUrl = '/dashboard';
        const redirectUrlComplete = '/onboarding';

        // Act
        await clerkOAuthModule.startOAuth('signUp', strategy, redirectUrl, redirectUrlComplete);

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      });

      it('should use default redirect URLs if not provided', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signUp', 'oauth_github');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy: 'oauth_github',
          redirectUrl: '/',
          redirectUrlComplete: '/',
        });
      });

      it('should throw error if signUp API is not available', async () => {
        // Arrange
        mockClerkClient.signUp = undefined;

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signUp', 'oauth_google')
        ).rejects.toThrow('signUp OAuth not available on this client instance');
      });

      it('should throw error if authenticateWithRedirect is not a function', async () => {
        // Arrange
        mockClerkClient.signUp = { authenticateWithRedirect: null };

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signUp', 'oauth_google')
        ).rejects.toThrow('signUp OAuth not available on this client instance');
      });

      it('should fallback to client.signUp if signUp is not available', async () => {
        // Arrange
        const clientSignUpMock = jest.fn().mockResolvedValue(undefined);
        mockClerkClient.signUp = undefined;
        mockClerkClient.client = {
          signUp: {
            authenticateWithRedirect: clientSignUpMock,
          },
        };

        // Act
        await clerkOAuthModule.startOAuth('signUp', 'oauth_facebook');

        // Assert
        expect(clientSignUpMock).toHaveBeenCalledWith({
          strategy: 'oauth_facebook',
          redirectUrl: '/',
          redirectUrlComplete: '/',
        });
      });
    });

    describe('signIn mode', () => {
      it('should call load on Clerk client', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signIn', 'oauth_google');

        // Assert
        expect(mockClerkClient.load).toHaveBeenCalledTimes(1);
      });

      it('should use signIn API for oauth', async () => {
        // Arrange
        const strategy = 'oauth_google';
        const redirectUrl = '/home';
        const redirectUrlComplete = '/profile';

        // Act
        await clerkOAuthModule.startOAuth('signIn', strategy, redirectUrl, redirectUrlComplete);

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy,
          redirectUrl,
          redirectUrlComplete,
        });
      });

      it('should use default redirect URLs if not provided', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signIn', 'oauth_twitter');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy: 'oauth_twitter',
          redirectUrl: '/',
          redirectUrlComplete: '/',
        });
      });

      it('should throw error if signIn API is not available', async () => {
        // Arrange
        mockClerkClient.signIn = undefined;

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signIn', 'oauth_google')
        ).rejects.toThrow('signIn OAuth not available on this client instance');
      });

      it('should throw error if authenticateWithRedirect is not a function', async () => {
        // Arrange
        mockClerkClient.signIn = { authenticateWithRedirect: 'not-a-function' };

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signIn', 'oauth_google')
        ).rejects.toThrow('signIn OAuth not available on this client instance');
      });

      it('should fallback to client.signIn if signIn is not available', async () => {
        // Arrange
        const clientSignInMock = jest.fn().mockResolvedValue(undefined);
        mockClerkClient.signIn = undefined;
        mockClerkClient.client = {
          signIn: {
            authenticateWithRedirect: clientSignInMock,
          },
        };

        // Act
        await clerkOAuthModule.startOAuth('signIn', 'oauth_microsoft');

        // Assert
        expect(clientSignInMock).toHaveBeenCalledWith({
          strategy: 'oauth_microsoft',
          redirectUrl: '/',
          redirectUrlComplete: '/',
        });
      });
    });

    describe('OAuth strategies', () => {
      it('should work with oauth_google strategy', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signUp', 'oauth_google');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith(
          expect.objectContaining({ strategy: 'oauth_google' })
        );
      });

      it('should work with oauth_github strategy', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signIn', 'oauth_github');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith(
          expect.objectContaining({ strategy: 'oauth_github' })
        );
      });

      it('should work with oauth_facebook strategy', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signUp', 'oauth_facebook');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith(
          expect.objectContaining({ strategy: 'oauth_facebook' })
        );
      });

      it('should work with any custom strategy string', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signIn', 'oauth_custom_provider');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith(
          expect.objectContaining({ strategy: 'oauth_custom_provider' })
        );
      });
    });

    describe('error handling', () => {
      it('should propagate errors from Clerk client load', async () => {
        // Arrange
        const loadError = new Error('Failed to load Clerk');
        mockClerkClient.load.mockRejectedValue(loadError);

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signUp', 'oauth_google')
        ).rejects.toThrow('Failed to load Clerk');
      });

      it('should propagate errors from authenticateWithRedirect', async () => {
        // Arrange
        const authError = new Error('OAuth redirect failed');
        mockAuthenticateWithRedirect.mockRejectedValue(authError);

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signIn', 'oauth_google')
        ).rejects.toThrow('OAuth redirect failed');
      });

      it('should throw error when both direct and client APIs are unavailable', async () => {
        // Arrange
        mockClerkClient.signUp = undefined;
        mockClerkClient.client = undefined;

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signUp', 'oauth_google')
        ).rejects.toThrow('signUp OAuth not available on this client instance');
      });

      it('should throw error when client exists but has no signUp', async () => {
        // Arrange
        mockClerkClient.signUp = undefined;
        mockClerkClient.client = { signIn: mockClerkClient.signIn };

        // Act & Assert
        await expect(
          clerkOAuthModule.startOAuth('signUp', 'oauth_google')
        ).rejects.toThrow('signUp OAuth not available on this client instance');
      });
    });

    describe('redirect URL handling', () => {
      it('should handle absolute URLs', async () => {
        // Act
        await clerkOAuthModule.startOAuth(
          'signUp',
          'oauth_google',
          'https://example.com/callback',
          'https://example.com/complete'
        );

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy: 'oauth_google',
          redirectUrl: 'https://example.com/callback',
          redirectUrlComplete: 'https://example.com/complete',
        });
      });

      it('should handle relative URLs', async () => {
        // Act
        await clerkOAuthModule.startOAuth(
          'signIn',
          'oauth_github',
          '/auth/callback',
          '/auth/complete'
        );

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy: 'oauth_github',
          redirectUrl: '/auth/callback',
          redirectUrlComplete: '/auth/complete',
        });
      });

      it('should handle empty string redirect URLs', async () => {
        // Act
        await clerkOAuthModule.startOAuth('signUp', 'oauth_google', '', '');

        // Assert
        expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
          strategy: 'oauth_google',
          redirectUrl: '',
          redirectUrlComplete: '',
        });
      });
    });
  });

  describe('default export', () => {
    it('should export startOAuth as default', () => {
      // Assert
      expect(clerkOAuthModule.default).toBe(clerkOAuthModule.startOAuth);
    });
  });

  describe('integration scenarios', () => {
    it('should complete full OAuth flow for sign up', async () => {
      // Arrange
      const strategy = 'oauth_google';
      const redirectUrl = '/welcome';
      const redirectUrlComplete = '/dashboard';

      // Act
      await clerkOAuthModule.startOAuth('signUp', strategy, redirectUrl, redirectUrlComplete);

      // Assert - Verify complete flow
      expect(mockClerkClient.load).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateWithRedirect).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    });

    it('should complete full OAuth flow for sign in', async () => {
      // Arrange
      const strategy = 'oauth_github';
      const redirectUrl = '/home';
      const redirectUrlComplete = '/profile';

      // Act
      await clerkOAuthModule.startOAuth('signIn', strategy, redirectUrl, redirectUrlComplete);

      // Assert - Verify complete flow
      expect(mockClerkClient.load).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateWithRedirect).toHaveBeenCalledTimes(1);
      expect(mockAuthenticateWithRedirect).toHaveBeenCalledWith({
        strategy,
        redirectUrl,
        redirectUrlComplete,
      });
    });

    it('should handle sequential OAuth calls', async () => {
      // Act - Multiple OAuth attempts
      await clerkOAuthModule.startOAuth('signUp', 'oauth_google');
      await clerkOAuthModule.startOAuth('signIn', 'oauth_github');
      await clerkOAuthModule.startOAuth('signUp', 'oauth_facebook');

      // Assert
      expect(mockClerkClient.load).toHaveBeenCalledTimes(3);
      expect(mockAuthenticateWithRedirect).toHaveBeenCalledTimes(3);
    });
  });
});
