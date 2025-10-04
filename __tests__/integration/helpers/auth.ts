/**
 * Authentication helpers for integration tests
 * 
 * Provides utilities for mocking authentication headers
 * and user contexts in API route tests
 */

/**
 * Generate mock user ID header
 */
export function getUserHeaders(userId: string): Headers {
  const headers = new Headers();
  headers.set('x-user-id', userId);
  headers.set('Content-Type', 'application/json');
  return headers;
}

/**
 * Generate headers without authentication
 */
export function getUnauthenticatedHeaders(): Headers {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  return headers;
}

/**
 * Mock user IDs for testing
 */
export const MOCK_USERS = {
  ALICE: 'user-alice-123',
  BOB: 'user-bob-456',
  CHARLIE: 'user-charlie-789',
} as const;

/**
 * Create a mock request with authentication
 */
export function createMockRequest(
  url: string,
  options: RequestInit & { userId?: string } = {}
): Request {
  const { userId, ...requestOptions } = options;
  
  const headers = userId ? getUserHeaders(userId) : getUnauthenticatedHeaders();
  
  // Merge custom headers if provided
  if (requestOptions.headers) {
    const customHeaders = new Headers(requestOptions.headers);
    customHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return new Request(url, {
    ...requestOptions,
    headers,
  });
}
