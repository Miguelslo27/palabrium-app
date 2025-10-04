import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  testEnvironment: 'node', // Node environment for integration tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/__tests__/unit/', // Exclude unit tests
  ],

  testMatch: [
    '**/__tests__/integration/**/*.{test,spec}.{ts,tsx}',
  ],

  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
      },
    }],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  verbose: true,

  // Increase timeout for database operations
  testTimeout: 30000,
};

export default config;
