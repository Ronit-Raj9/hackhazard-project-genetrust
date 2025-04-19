'use client';

import { createContext } from 'react';

// Define the User type based on your application's requirements
export interface User {
  id: string;
  name?: string;
  email?: string;
  walletAddress?: string;
  role?: string;
  profileImageUrl?: string;
  authProvider?: string;
  isVerified?: boolean;
  // Add any other user properties your application needs
}

// Define the authentication state
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Define the authentication actions/dispatch
export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Define the authentication methods that will be exposed via the context
export interface AuthContextMethods {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithWallet: (walletAddress: string) => Promise<void>;
  loginWithGoogle: (idToken: string, email: string, name?: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Define the combined interface for the state context
export interface AuthContextInterface extends AuthState, AuthContextMethods {
  isInitialized: boolean;
}

// Create the initial state
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Create contexts
export const AuthStateContext = createContext<AuthState | undefined>(undefined);
export const AuthDispatchContext = createContext<React.Dispatch<AuthAction> | undefined>(undefined);
export const AuthMethodsContext = createContext<AuthContextMethods | undefined>(undefined);

// Create a reducer to handle auth state updates
export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}; 