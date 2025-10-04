"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import getClientUserId from '@/lib/getClientUserId';

/**
 * User Context - Centralizes user authentication state
 * 
 * This context provides:
 * - userId: Current user's ID (null if not authenticated)
 * - loading: Whether user data is being loaded
 * - isAuthor: Helper function to check if user is the author of content
 * 
 * Benefits:
 * - Eliminates repeated getClientUserId() calls in 8+ components
 * - Provides single source of truth for user state
 * - Simplifies authentication checks from ~15 lines to 1 line
 */

interface UserContextValue {
  userId: string | null;
  loading: boolean;
  isAuthor: (authorId?: string | null) => boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getClientUserId()
      .then((id) => {
        if (!mounted) return;
        setUserId(id);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading user ID:', err);
        if (!mounted) return;
        setUserId(null);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isAuthor = useCallback(
    (authorId?: string | null) => {
      return Boolean(userId && authorId && userId === authorId);
    },
    [userId]
  );

  return (
    <UserContext.Provider value={{ userId, loading, isAuthor }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user context
 * 
 * @throws Error if used outside UserProvider
 * @returns User context value with userId, loading, and isAuthor helper
 * 
 * @example
 * ```tsx
 * // Before (15 lines):
 * const [userId, setUserId] = useState<string | null>(null);
 * const [isAuthor, setIsAuthor] = useState(false);
 * 
 * useEffect(() => {
 *   let mounted = true;
 *   getClientUserId().then((id) => {
 *     if (!mounted) return;
 *     setUserId(id);
 *     setIsAuthor(Boolean(id && authorId && id === authorId));
 *   });
 *   return () => { mounted = false; };
 * }, [authorId]);
 * 
 * // After (1 line):
 * const { userId, isAuthor } = useUser();
 * const isContentAuthor = isAuthor(authorId);
 * ```
 */
export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
