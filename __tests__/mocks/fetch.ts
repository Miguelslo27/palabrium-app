/**
 * Mock for global fetch API
 * This file provides utilities to mock fetch requests in tests
 */

export interface MockFetchResponse {
  ok: boolean;
  status: number;
  statusText?: string;
  json: () => Promise<any>;
  text: () => Promise<string>;
  blob: () => Promise<Blob>;
  headers: Headers;
}

// Create a mock response
export const createMockResponse = (
  data: any,
  options: { status?: number; statusText?: string; ok?: boolean } = {}
): MockFetchResponse => {
  const {
    status = 200,
    statusText = 'OK',
    ok = status >= 200 && status < 300,
  } = options;

  return {
    ok,
    status,
    statusText,
    json: jest.fn().mockResolvedValue(data),
    text: jest.fn().mockResolvedValue(JSON.stringify(data)),
    blob: jest.fn().mockResolvedValue(new Blob([JSON.stringify(data)])),
    headers: new Headers(),
  };
};

// Mock fetch success
export const mockFetchSuccess = (data: any, status: number = 200) => {
  global.fetch = jest.fn().mockResolvedValue(createMockResponse(data, { status }));
};

// Mock fetch error
export const mockFetchError = (status: number = 500, message: string = 'Internal Server Error') => {
  global.fetch = jest.fn().mockResolvedValue(
    createMockResponse({ error: message }, { status, ok: false })
  );
};

// Mock fetch network error
export const mockFetchNetworkError = (message: string = 'Network error') => {
  global.fetch = jest.fn().mockRejectedValue(new Error(message));
};

// Mock fetch with custom implementation
export const mockFetchCustom = (implementation: (...args: any[]) => Promise<MockFetchResponse>) => {
  global.fetch = jest.fn().mockImplementation(implementation);
};

// Reset fetch mock
export const resetFetchMock = () => {
  if (global.fetch && 'mockClear' in global.fetch) {
    (global.fetch as jest.Mock).mockClear();
  }
};

// Helper to get fetch call arguments
export const getFetchCalls = (): Array<[string, RequestInit?]> => {
  if (global.fetch && 'mock' in global.fetch) {
    return (global.fetch as jest.Mock).mock.calls;
  }
  return [];
};

// Helper to verify fetch was called with specific URL
export const expectFetchCalledWith = (url: string, options?: RequestInit) => {
  expect(global.fetch).toHaveBeenCalledWith(url, options);
};

// Mock API responses for common endpoints
export const mockAPIResponses = {
  stories: {
    list: () => mockFetchSuccess({ items: [], total: 0 }),
    get: (id: string) => mockFetchSuccess({ _id: id, title: 'Test Story' }),
    create: () => mockFetchSuccess({ _id: '123', title: 'New Story' }, 201),
    update: () => mockFetchSuccess({ _id: '123', title: 'Updated Story' }),
    delete: () => mockFetchSuccess({ deleted: true }),
  },
  chapters: {
    list: () => mockFetchSuccess([]),
    get: (id: string) => mockFetchSuccess({ _id: id, title: 'Test Chapter' }),
    create: () => mockFetchSuccess({ _id: '123', title: 'New Chapter' }, 201),
    update: () => mockFetchSuccess({ _id: '123', title: 'Updated Chapter' }),
    delete: () => mockFetchSuccess({ deleted: true }),
  },
  comments: {
    list: () => mockFetchSuccess([]),
    create: () => mockFetchSuccess({ _id: '123', content: 'New Comment' }, 201),
  },
};
