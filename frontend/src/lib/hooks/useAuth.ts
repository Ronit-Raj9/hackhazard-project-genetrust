import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '../api';
import { useUserStore } from '../store';

export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const { user, setUser, isLoading, setLoading, error, setError } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if user is authenticated when component mounts
  useEffect(() => {
    // Skip the auth check if we're on specific pages
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isLoginPage = pathname === '/login';
    const isHomePage = pathname === '/';
    const isGoogleCallbackPage = pathname.includes('/auth/google/callback');
    const isRegisterPage = pathname === '/register';
    const isChainSightPage = pathname.includes('/chainSight');
    
    // Don't auto-check auth on these pages unless specifically required
    if ((isLoginPage || isHomePage || isGoogleCallbackPage || isRegisterPage || isChainSightPage) && !requireAuth) {
      setIsInitialized(true);
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.log('Checking authentication status...');
        setLoading(true);
        
        // First check if we have a token in localStorage as fallback
        const token = localStorage.getItem('auth_token');
        if (token) {
          console.log('Found authentication token in localStorage');
        }
        
        // Attempt to get current user (this will use cookies or token header)
        const response = await authAPI.getCurrentUser();
        console.log('Authentication successful, user data received');
        
        setUser(response.data.data.user);
        setError(null);
      } catch (err: any) {
        console.error('Authentication check failed:', err?.response?.status || err.message || err);
        setUser(null);
        
        // Handle network errors gracefully
        if (!err.response) {
          console.log('Network error during authentication check - continuing as guest');
          // Never redirect on network errors
          setError("Network error. Please check your connection.");
          return;
        }
        
        // Only redirect if auth is required for this route and it's not a network error
        if (requireAuth && err.response) {
          console.log('Authentication required for this route, redirecting to login');
          router.push('/login');
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, [requireAuth, router, setError, setLoading, setUser]);

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      console.log('Initiating Google login...');
      setLoading(true);
      
      const response = await authAPI.loginWithGoogle();
      console.log('Google auth URL received:', response.data);
      
      // Check if the authUrl is at different path in the response
      const authUrl = response.data.data?.authUrl || response.data.authUrl;
      
      if (!authUrl) {
        console.error('No auth URL in response:', response.data);
        throw new Error('No authentication URL received from server');
      }
      
      // Navigate to Google authentication page
      window.location.href = authUrl;
      return;
    } catch (err: any) {
      console.error('Google login initialization error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to initiate Google login';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Login with wallet
  const loginWithWallet = async (walletAddress: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.loginWithWallet(walletAddress);
      setUser(response.data.data.user);
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

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      setUser(response.data.data.user);
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
      setUser(response.data.data.user);
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
      await authAPI.logout();
      setUser(null);
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Logout failed';
      setError(errorMessage);
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
    isInitialized,
  };
} 