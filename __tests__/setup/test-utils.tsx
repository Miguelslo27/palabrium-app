/**
 * Test utilities for rendering components with providers
 * This file provides custom render functions and test helpers
 * 
 * Note: UserProvider removed after RSC migration - now using Clerk directly
 */

import React from 'react';
import { render as rtlRender, RenderOptions, renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react';

// Test provider wrapper - currently empty but kept for future providers if needed
interface TestProviderProps {
  children: React.ReactNode;
}

const TestProviders: React.FC<TestProviderProps> = ({ children }) => {
  return <>{children}</>;
};

// Custom render function that includes providers
function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: TestProviders, ...options });
}

// Custom renderHook function that includes providers
function renderHookWithProviders<Result, Props>(
  hook: (initialProps: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>
) {
  return rtlRenderHook(hook, { wrapper: TestProviders as any, ...options });
}

// Re-export everything from React Testing Library EXCEPT render and renderHook
export * from '@testing-library/react';

// Export custom functions with correct names (these will override the re-exported ones)
export { renderWithProviders as render, renderHookWithProviders as renderHook };

