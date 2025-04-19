'use client';

/**
 * Main Authentication Hooks File
 * 
 * This file contains all authentication-related hooks and functionality.
 * It supports multiple authentication methods:
 * - Context-based authentication (useAuthState, useAuthDispatch, useAuthMethods)
 * - Store-based authentication (useAuth)
 * - Wallet authentication
 * - Email/password authentication
 * 
 * All components should import authentication hooks from this file using:
 * import { useAuth } from '@/lib/hooks/useAuth';
 * or
 * import { useAuthState, useAuthMethods } from '@/lib/hooks/useAuth';
 */

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../api';
import { useUserStore } from '../store';
import { 
  AuthState, 
  AuthAction,
  AuthContextMethods,
  AuthStateContext, 
  AuthDispatchContext,
  AuthMethodsContext
} from '../contexts/AuthContext';

// Create a simple event system to broadcast auth state changes
class AuthEventEmitter {
  private listeners: Function[] = [];

  subscribe(listener: Function) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(event: string, data?: any) {
    this.listeners.forEach(listener => {
      listener(event, data);
    });
  }
}

// Create a unique ID for guest users
const generateGuestId = (): string => {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Guest user type
interface GuestUser {
  id: string;
  name: string;
  email?: string;
  walletAddress?: string;
  role: string;
  isGuest: true;
  guestId: string;
  createdAt: number;
  preferences?: {
    theme?: string;
    aiVoice?: string;
  };
  profileImageUrl?: string;
  authProvider?: string;
  isVerified?: boolean;
}

// Guest user storage management
const guestStorage = {
  setGuestUser: (guestUser: GuestUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('guest_user', JSON.stringify(guestUser));
    }
  },
  
  getGuestUser: (): GuestUser | null => {
    if (typeof window !== 'undefined') {
      const guestUserJson = localStorage.getItem('guest_user');
      if (guestUserJson) {
        try {
          return JSON.parse(guestUserJson);
        } catch (e) {
          console.error('Failed to parse guest user from localStorage:', e);
        }
      }
    }
    return null;
  },
  
  clearGuestUser: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('guest_user');
    }
  },
  
  // Store data for guest users
  storeGuestData: (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      const guestUser = guestStorage.getGuestUser();
      if (guestUser) {
        const storageKey = `guest_data_${guestUser.guestId}_${key}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
      }
    }
  },
  
  // Get data for guest users
  getGuestData: (key: string): any => {
    if (typeof window !== 'undefined') {
      const guestUser = guestStorage.getGuestUser();
      if (guestUser) {
        const storageKey = `guest_data_${guestUser.guestId}_${key}`;
        const data = localStorage.getItem(storageKey);
        if (data) {
          try {
            return JSON.parse(data);
          } catch (e) {
            console.error(`Failed to parse guest data for key "${key}":`, e);
          }
        }
      }
    }
    return null;
  },
  
  // Clear all guest data
  clearAllGuestData: (guestId: string) => {
    if (typeof window !== 'undefined') {
      // Find all localStorage keys associated with this guest
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`guest_data_${guestId}_`)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove each key
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    }
  }
};

export const authEvents = new AuthEventEmitter();

export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const { user, setUser, isLoading, setLoading, error, setError } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Subscribe to auth events
  useEffect(() => {
    const unsubscribe = authEvents.subscribe((event: string) => {
      if (event === 'auth_state_changed') {
        // Force a recheck of authentication status
        checkAuth();
      }
    });
    
    return unsubscribe;
  }, []);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    // Skip the auth check if we're on specific pages
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isLoginPage = pathname === '/login';
    const isHomePage = pathname === '/';
    const isRegisterPage = pathname === '/register';
    const isChainSightPage = pathname.includes('/chainSight');
    
    // Don't auto-check auth on these pages unless specifically required
    if ((isLoginPage || isHomePage || isRegisterPage || isChainSightPage) && !requireAuth) {
      setIsInitialized(true);
      return;
    }
    
    checkAuth();
  }, [requireAuth, router, setError, setLoading, setUser]);
  
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      // Check for guest login first
      const guestUser = guestStorage.getGuestUser();
      if (guestUser) {
        console.log('Found guest user session:', guestUser.id);
        setUser(guestUser);
        setError(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      // If not a guest, attempt to get current user (this will use cookies or token header)
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data.user);
      setError(null);
    } catch (err: any) {
      setUser(null);
      
      // Handle network errors gracefully
      if (!err.response) {
        setError("Network error. Please check your connection.");
        return;
      }
      
      // Only redirect if auth is required for this route and it's not a network error
      if (requireAuth && err.response) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // Login as guest
  const loginAsGuest = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate a unique guest ID
      const guestId = generateGuestId();
      
      // Create guest user object
      const guestUser: GuestUser = {
        id: guestId,
        name: 'Guest User',
        isGuest: true,
        guestId,
        createdAt: Date.now(),
        role: 'user',
        email: undefined,
        walletAddress: undefined,
        preferences: {
          theme: 'dark',
          aiVoice: 'default'
        },
        profileImageUrl: undefined,
        authProvider: 'guest',
        isVerified: true
      };
      
      // Store guest user info in localStorage
      guestStorage.setGuestUser(guestUser);
      
      // Set user in state
      setUser(guestUser as any);
      
      // Broadcast auth state change
      authEvents.emit('auth_state_changed', { isAuthenticated: true, isGuest: true });
      
      return guestUser;
    } catch (err: any) {
      const errorMessage = 'Failed to create guest session';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Continue from login/register as guest to complete profile later
  const continueAsGuest = () => {
    loginAsGuest();
    // Navigate to dashboard
    router.push('/dashboard');
  };

  // Check if current user is a guest
  const isGuest = () => {
    return !!user && 'isGuest' in user && user.isGuest === true;
  };

  // Get guest data by key
  const getGuestData = (key: string) => {
    return guestStorage.getGuestData(key);
  };
  
  // Store guest data by key
  const storeGuestData = (key: string, data: any) => {
    guestStorage.storeGuestData(key, data);
  };

  // Login with wallet
  const loginWithWallet = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.loginWithWallet(walletAddress);
      setUser(response.data.data.user);
      // Broadcast auth state change
      authEvents.emit('auth_state_changed', { isAuthenticated: true });
      return response.data.data;
    } catch (err: any) {
      let errorMessage = 'Login failed';
      if (!err.response) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.response?.data?.message || 'Login failed';
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async (idToken: string, email: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.loginWithGoogle(idToken, email, name);
      setUser(response.data.data.user);
      // Broadcast auth state change
      authEvents.emit('auth_state_changed', { isAuthenticated: true });
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      
      // Clear any guest data if we're transitioning from guest to logged in
      const guestUser = guestStorage.getGuestUser();
      if (guestUser) {
        guestStorage.clearGuestUser();
        guestStorage.clearAllGuestData(guestUser.guestId);
      }
      
      setUser(response.data.data.user);
      // Broadcast auth state change
      authEvents.emit('auth_state_changed', { isAuthenticated: true });
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(email, password, name);
      
      // Clear any guest data if we're transitioning from guest to registered
      const guestUser = guestStorage.getGuestUser();
      if (guestUser) {
        guestStorage.clearGuestUser();
        guestStorage.clearAllGuestData(guestUser.guestId);
      }
      
      setUser(response.data.data.user);
      // Broadcast auth state change
      authEvents.emit('auth_state_changed', { isAuthenticated: true });
      return response.data.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.forgotPassword(email);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.resetPassword(token, password);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.changePassword(currentPassword, newPassword);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Check if guest user
      if (isGuest()) {
        // For guest users, just clear local storage data
        const guestUser = guestStorage.getGuestUser();
        if (guestUser) {
          guestStorage.clearGuestUser();
          guestStorage.clearAllGuestData(guestUser.guestId);
        }
        setUser(null);
        // Broadcast auth state change
        authEvents.emit('auth_state_changed', { isAuthenticated: false });
        router.push('/login');
        return;
      }
      
      // For regular users, call API logout
      await authAPI.logout();
      setUser(null);
      // Broadcast auth state change
      authEvents.emit('auth_state_changed', { isAuthenticated: false });
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Logout failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerification = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.resendVerification(email);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend verification email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify email with token
  const verifyEmail = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.verifyEmail(token);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to verify email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    loginWithWallet,
    loginWithGoogle,
    register,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    resendVerification,
    verifyEmail,
    loginAsGuest,
    continueAsGuest,
    isGuest,
    getGuestData,
    storeGuestData,
    isInitialized,
  };
}

// Custom hook to access auth state directly from context
export const useAuthState = (): AuthState => {
  // Force component using this hook to rerender when auth state changes
  const [, setForceUpdate] = useState({});
  
  useEffect(() => {
    const unsubscribe = authEvents.subscribe(() => {
      // Force rerender
      setForceUpdate({});
    });
    
    return unsubscribe;
  }, []);
  
  try {
    const context = useContext(AuthStateContext);
    
    if (context === undefined) {
      // If used outside AuthProvider, fallback to store-based auth
      const storeAuth = useUserStore();
      return {
        user: storeAuth.user,
        isAuthenticated: !!storeAuth.user,
        isLoading: storeAuth.isLoading,
        error: storeAuth.error
      };
    }
    
    return context;
  } catch (error) {
    // If context is not available at all, fallback to store-based auth
    const storeAuth = useUserStore();
    return {
      user: storeAuth.user,
      isAuthenticated: !!storeAuth.user,
      isLoading: storeAuth.isLoading,
      error: storeAuth.error
    };
  }
};

// Custom hook to access auth dispatch
export const useAuthDispatch = (): React.Dispatch<AuthAction> => {
  const context = useContext(AuthDispatchContext);
  
  if (context === undefined) {
    // Return a no-op function that matches the dispatch signature
    return () => {};
  }
  
  return context;
};

// Custom hook to access auth methods
export const useAuthMethods = (): AuthContextMethods => {
  const context = useContext(AuthMethodsContext);
  
  if (context === undefined) {
    // Create a standalone instance of the useAuth hook's methods
    const {
      login,
      loginWithWallet,
      loginWithGoogle,
      register,
      forgotPassword,
      resetPassword,
      changePassword,
      logout
    } = useAuth();
    
    // Return with required methods to match AuthContextMethods interface
    return {
      login,
      loginWithWallet,
      loginWithGoogle,
      register,
      forgotPassword,
      resetPassword,
      changePassword,
      logout,
      // Add the missing methods to satisfy the interface
      verifyEmail: async (token: string) => {
        console.warn('verifyEmail called from fallback implementation');
        return false;
      },
      resendVerification: async (email: string) => {
        console.warn('resendVerification called from fallback implementation');
        return false;
      }
    };
  }
  
  return context;
};