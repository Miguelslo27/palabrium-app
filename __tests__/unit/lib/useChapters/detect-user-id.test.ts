/**
 * Tests for useChapters - detectUserId
 * 
 * Tests for user ID detection from Clerk or fallback sources
 */

// Mock clerk-client before importing useChapters
jest.mock('@/lib/clerk-client');

import { setupModuleAndMocks, restoreMocks } from './shared/helpers';

describe('useChapters - detectUserId', () => {
  let useChaptersModule: any;
  let mockGetClerkClient: jest.Mock;
  let mockClerk: any;

  beforeEach(() => {
    const setup = setupModuleAndMocks();
    useChaptersModule = setup.useChaptersModule;
    mockClerk = setup.mockClerk;
    mockGetClerkClient = setup.mockGetClerkClient;
  });

  afterEach(() => {
    restoreMocks();
  });

  it('should return user ID from clerk.user.id', async () => {
    // Arrange
    mockClerk.user = { id: 'clerk-user-123' };

    // Act
    const userId = await useChaptersModule.detectUserId();

    // Assert
    expect(userId).toBe('clerk-user-123');
    expect(mockClerk.load).toHaveBeenCalledTimes(1);
  });

  it('should return user ID from clerk.client.user.id if clerk.user is not available', async () => {
    // Arrange
    mockClerk.user = undefined;
    mockClerk.client = { user: { id: 'client-user-456' } };

    // Act
    const userId = await useChaptersModule.detectUserId();

    // Assert
    expect(userId).toBe('client-user-456');
  });

  it('should return null if no user ID is found', async () => {
    // Arrange
    mockClerk.user = undefined;
    mockClerk.client = undefined;

    // Act
    const userId = await useChaptersModule.detectUserId();

    // Assert
    expect(userId).toBeNull();
  });

  it('should handle Clerk error and fallback to window.__USER_ID__', async () => {
    // Arrange - Make clerk.load throw error
    mockClerk.load.mockRejectedValueOnce(new Error('Load failed'));
    (global.window as any).__USER_ID__ = 'fallback-user-123';

    // Act
    const userId = await useChaptersModule.detectUserId();

    // Assert
    expect(userId).toBe('fallback-user-123');

    // Cleanup
    delete (global.window as any).__USER_ID__;
  });

  it('should return null if Clerk throws error and window.__USER_ID__ is not set', async () => {
    // Arrange
    mockGetClerkClient.mockImplementation(() => {
      throw new Error('Clerk not available');
    });
    (global as any).window = {};

    // Act
    const userId = await useChaptersModule.detectUserId();

    // Assert
    expect(userId).toBeNull();
  });

  it('should return null if Clerk throws error and window is undefined', async () => {
    // Arrange
    mockGetClerkClient.mockImplementation(() => {
      throw new Error('Clerk not available');
    });
    delete (global as any).window;

    // Act
    const userId = await useChaptersModule.detectUserId();

    // Assert
    expect(userId).toBeNull();
  });

  it('should call clerk.load before accessing user', async () => {
    // Arrange
    mockClerk.user = { id: 'test-user' };

    // Act
    await useChaptersModule.detectUserId();

    // Assert
    expect(mockClerk.load).toHaveBeenCalledTimes(1);
  });
});
