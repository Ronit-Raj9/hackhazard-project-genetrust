'use client';

import { useEffect, useReducer, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AuthStateContext, 
  AuthDispatchContext, 
  AuthMethodsContext,
  authReducer, 
  initialAuthState,
  AuthContextMethods
} from './AuthContext';
import { authAPI } from '@/lib/api';

// Create a loading spinner component
const FullPageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-50">
    <div className="relative w-20 h-20 mx-auto">
      <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
      <div className="absolute inset-4 rounded-full border-t-2 border-l-2 border-cyan-400 animate-spin-slow"></div>
    </div>
    <p className="text-indigo-300 mt-20">Loading...</p>
  </div>
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Method implementations
  const authMethods: AuthContextMethods = {
    login: async (email: string, password: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        const response = await authAPI.login(email, password);
        
        // Store token in localStorage as a fallback mechanism
        if (response?.data?.data?.accessToken) {
          localStorage.setItem('auth_token', response.data.data.accessToken);
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data.user });
        return Promise.resolve(response.data.data);
      } catch (err: any) {
        console.error('Login error:', err);
        const errorMessage = err.response?.data?.message || 'Login failed';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return Promise.reject(err);
      }
    },

    register: async (email: string, password: string, name: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        const response = await authAPI.register(email, password, name);
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data.user });
        return Promise.resolve();
      } catch (err: any) {
        console.error('Registration error:', err);
        const errorMessage = err.response?.data?.message || 'Registration failed';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return Promise.reject(err);
      }
    },

    logout: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        await authAPI.logout();
        dispatch({ type: 'LOGOUT_SUCCESS' });
        router.push('/login');
        return Promise.resolve();
      } catch (err: any) {
        console.error('Logout error:', err);
        const errorMessage = err.response?.data?.message || 'Logout failed';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return Promise.reject(err);
      }
    },

    loginWithGoogle: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        const response = await authAPI.loginWithGoogle();
        const authUrl = response.data.data?.authUrl || response.data.authUrl;
        
        if (!authUrl) {
          throw new Error('No authentication URL received from server');
        }
        
        // Navigate to Google authentication page
        window.location.href = authUrl;
        return Promise.resolve();
      } catch (err: any) {
        console.error('Google login error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to initiate Google login';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return Promise.reject(err);
      }
    },

    loginWithWallet: async (walletAddress: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        console.log(`Attempting to login with wallet: ${walletAddress}`);
        
        // Try to call the backend API
        try {
          const response = await authAPI.loginWithWallet(walletAddress);
          console.log('Successfully authenticated with wallet address');
          
          // Explicitly save token from wallet auth response as fallback
          const token = response?.data?.data?.accessToken;
          if (token) {
            localStorage.setItem('auth_token', token);
          }
          
          dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data.user });
          return Promise.resolve();
        } catch (err: any) {
          console.error('Wallet login API error:', err?.response?.status, err?.response?.data?.message || err.message);
          
          // If the backend is unavailable or returns certain errors, check if we're in development mode
          // and use a local fallback to allow developers to work without the backend
          if (
            process.env.NODE_ENV === 'development' && 
            (!err.response || err.response.status === 404 || err.response.status >= 500)
          ) {
            console.warn('Backend unavailable in development - using fallback wallet auth');
            
            // Create a mock user for development only
            const mockUser = {
              id: `user_${Math.random().toString(36).substring(2, 11)}`,
              walletAddress: walletAddress,
              name: `User_${walletAddress.substring(0, 6)}`,
              role: 'user'
            };
            
            // Save a mock token for development
            localStorage.setItem('auth_token', 'dev_wallet_auth_token');
            
            dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
            return Promise.resolve();
          } else {
            // In production or for other errors, propagate the error
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Wallet login error:', err);
        let errorMessage = 'Login failed';
        
        if (!err.response) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.response.status === 401) {
          errorMessage = 'Unauthorized. Please check your wallet connection.';
        } else if (err.response.status === 403) {
          errorMessage = 'Access denied. You may not have permission to login with this wallet.';
        } else {
          errorMessage = err.response?.data?.message || 'Login failed';
        }
        
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return Promise.reject(err);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    forgotPassword: async (email: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        await authAPI.forgotPassword(email);
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } catch (err: any) {
        console.error('Forgot password error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to send reset email';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return false;
      }
    },

    resetPassword: async (token: string, password: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        await authAPI.resetPassword(token, password);
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } catch (err: any) {
        console.error('Reset password error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to reset password';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return false;
      }
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'CLEAR_ERROR' });
        
        await authAPI.changePassword(currentPassword, newPassword);
        dispatch({ type: 'SET_LOADING', payload: false });
        return true;
      } catch (err: any) {
        console.error('Change password error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to change password';
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        return false;
      }
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Check if we're on specific pages where auth check isn't necessary
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isLoginPage = pathname === '/login' || pathname.includes('/login');
          const isHomePage = pathname === '/';
          const isGoogleCallbackPage = pathname.includes('/auth/google/callback');
          const isRegisterPage = pathname === '/register';
          const isChainSightPage = pathname.includes('/chainSight');

          // Don't check auth on these pages to avoid unnecessary redirects
          if (isLoginPage || isHomePage || isGoogleCallbackPage || isRegisterPage || isChainSightPage) {
            dispatch({ type: 'SET_LOADING', payload: false });
            setIsInitialized(true);
            return;
          }
        }

        // First check if we have a token in localStorage as fallback
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.debug('Found authentication token in localStorage');
          // Set the token in axios headers
          const api = authAPI as any;
          if (api.setToken) {
            api.setToken(token);
          }
        }

        // Try to fetch the current user
        try {
          const response = await authAPI.getCurrentUser();
          dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.data.user });
        } catch (err: any) {
          console.warn('Auth check failed:', err?.response?.status || err.message || err);
          
          // Not authenticated - clean and redirect on protected routes
          if (err.response && err.response.status === 401) {
            // It's a 401 so we just need to clear the auth state
            localStorage.removeItem('auth_token');
            dispatch({ type: 'LOGOUT_SUCCESS' });
            
            // Check if current route requires authentication
            const pathname = window.location.pathname;
            const protectedRoutes = ['/dashboard', '/profile', '/settings', '/projects'];
            const requiresAuth = protectedRoutes.some(route => pathname.startsWith(route));
            
            if (requiresAuth) {
              console.log('Protected route. Redirecting to login');
              router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            }
          } else {
            // For network errors or unexpected errors, we show a message but don't redirect
            if (!err.response) {
              dispatch({ type: 'AUTH_ERROR', payload: 'Network error. Please check your connection.' });
            } else {
              dispatch({ type: 'AUTH_ERROR', payload: err.response?.data?.message || 'Authentication check failed' });
            }
          }
        }
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, [router]);

  // While checking auth status on initial load, show a loader
  if (!isInitialized) {
    return <FullPageLoader />;
  }

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        <AuthMethodsContext.Provider value={authMethods}>
          {children}
        </AuthMethodsContext.Provider>
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}; 