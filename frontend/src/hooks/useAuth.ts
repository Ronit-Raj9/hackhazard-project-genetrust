'use client';

import { useContext } from 'react';
import { 
  AuthStateContext, 
  AuthDispatchContext, 
  AuthMethodsContext 
} from '@/lib/contexts/AuthContext';

/**
 * Custom hook for accessing authentication state, methods, and dispatch
 * @returns Object containing auth state, methods, and dispatch function
 */
export function useAuth() {
  const state = useContext(AuthStateContext);
  const dispatch = useContext(AuthDispatchContext);
  const methods = useContext(AuthMethodsContext);

  if (state === undefined || dispatch === undefined || methods === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return {
    ...state,
    ...methods,
    dispatch
  };
}

/**
 * Hook to access only the authentication state
 */
export function useAuthState() {
  const state = useContext(AuthStateContext);
  
  if (state === undefined) {
    throw new Error('useAuthState must be used within an AuthProvider');
  }
  
  return state;
}

/**
 * Hook to access only the authentication dispatch function
 */
export function useAuthDispatch() {
  const dispatch = useContext(AuthDispatchContext);
  
  if (dispatch === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthProvider');
  }
  
  return dispatch;
}

/**
 * Hook to access only the authentication methods
 */
export function useAuthMethods() {
  const methods = useContext(AuthMethodsContext);
  
  if (methods === undefined) {
    throw new Error('useAuthMethods must be used within an AuthProvider');
  }
  
  return methods;
}
