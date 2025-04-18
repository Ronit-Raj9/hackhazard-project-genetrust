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
      
      // Just directly call the API function which redirects the user
      // No need to wait for a response as it will redirect the browser
      authAPI.loginWithGoogle();
      
      // Note: This code won't execute as the page will be redirected
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