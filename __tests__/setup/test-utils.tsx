/**
 * Test utilities for rendering components with providers
 * This file provides custom render functions and test helpers
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { UserProvider } from '@/contexts/UserContext';

// Test provider wrapper that includes all necessary providers
interface TestProviderProps {
  children: React.ReactNode;
}

const TestProviders: React.FC<TestProviderProps> = ({ children }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  );
};

// Custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: TestProviders, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render as default
export { renderWithProviders as render };
