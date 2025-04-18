'use client';

import { useState, useCallback } from 'react';
import { authAPI } from '@/lib/api';

interface UseGoogleAuthReturn {
  loginWithGoogle: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for handling Google OAuth authentication
 * 
 * @returns Object containing login function, loading state, and error state
 */
export function useGoogleAuth(): UseGoogleAuthReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);
      
      // The authAPI.loginWithGoogle function redirects the user to Google OAuth
      // It uses window.location.href = googleAuthUrl which won't return
      authAPI.loginWithGoogle();
      
      // Note: No need to set loading to false as the page will redirect away
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to initiate Google login');
      console.error('Google login error:', err);
    }
  }, []);

  return {
    loginWithGoogle,
    isLoading,
    error
  };
} 