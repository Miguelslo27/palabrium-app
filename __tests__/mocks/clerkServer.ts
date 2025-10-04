/**
 * Mock for @clerk/backend server-side client
 * This file mocks the Clerk server-side SDK for API testing
 */

import { mockUser } from './clerk';

// Mock Clerk user from server perspective
export const mockClerkServerUser = {
  id: mockUser.id,
  firstName: mockUser.firstName,
  lastName: mockUser.lastName,
  fullName: mockUser.fullName,
  imageUrl: mockUser.imageUrl,
  primaryEmailAddress: mockUser.primaryEmailAddress,
  emailAddresses: mockUser.emailAddresses,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

// Mock users API
export const mockUsersAPI = {
  getUser: jest.fn().mockResolvedValue(mockClerkServerUser),
  getUserList: jest.fn().mockResolvedValue([mockClerkServerUser]),
  updateUser: jest.fn().mockResolvedValue(mockClerkServerUser),
  deleteUser: jest.fn().mockResolvedValue({ deleted: true }),
};

// Mock clerkClient from @clerk/backend
export const mockClerkClient = {
  users: mockUsersAPI,
};

// Helper to set getUser response
export const setMockClerkUser = (user: typeof mockClerkServerUser | null) => {
  if (user) {
    mockUsersAPI.getUser.mockResolvedValue(user);
  } else {
    mockUsersAPI.getUser.mockRejectedValue(new Error('User not found'));
  }
};

// Helper to simulate user not found
export const setMockClerkUserNotFound = () => {
  mockUsersAPI.getUser.mockRejectedValue({
    status: 404,
    message: 'User not found',
  });
};

// Reset server mocks
export const resetClerkServerMocks = () => {
  mockUsersAPI.getUser.mockClear();
  mockUsersAPI.getUserList.mockClear();
  mockUsersAPI.updateUser.mockClear();
  mockUsersAPI.deleteUser.mockClear();

  // Reset to default behavior
  mockUsersAPI.getUser.mockResolvedValue(mockClerkServerUser);
  mockUsersAPI.getUserList.mockResolvedValue([mockClerkServerUser]);
};

export default mockClerkClient;
