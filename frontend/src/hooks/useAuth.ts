'use client';

import { useContext } from 'react';
import {
  AuthDispatchContext,
  AuthStateContext,
  AuthMethodsContext,
  AuthState,
  AuthAction,
  AuthContextMethods
} from '@/lib/contexts/AuthContext';

/**
 * Custom hook to access the authentication context
 * @returns An object containing all auth state, dispatch function and auth methods
 * @throws Error if used outside of an AuthProvider
 */
export const useAuth = () => {
  const state = useContext(AuthStateContext);
  const dispatch = useContext(AuthDispatchContext);
  const methods = useContext(AuthMethodsContext);

  // Check if contexts are undefined (not wrapped in AuthProvider)
  if (state === undefined || dispatch === undefined || methods === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    // Spread all auth state
    ...state,
    // Add dispatch function
    dispatch,
    // Spread all auth methods
    ...methods
  };
};

/**
 * Hook to access only the authentication state
 */
export const useAuthState = () => {
  const state = useContext(AuthStateContext);
  
  if (state === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  
  return state;
};

/**
 * Hook to access only the authentication dispatch function
 */
export const useAuthDispatch = () => {
  const dispatch = useContext(AuthDispatchContext);
  
  if (dispatch === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  
  return dispatch;
};

/**
 * Hook to access only the authentication methods
 */
export const useAuthMethods = () => {
  const methods = useContext(AuthMethodsContext);
  
  if (methods === undefined) {
    throw new Error('useAuthMethods must be used within an AuthProvider');
  }
  
  return methods;
}; 