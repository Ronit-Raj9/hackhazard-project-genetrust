'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState, useAuthMethods } from '@/lib/hooks/useAuth';
import { useAccount } from 'wagmi';
import { WalletConnector } from '@/components/chainSight/WalletConnector';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Login() {
  const { user, isLoading, isAuthenticated } = useAuthState();
  const { loginWithWallet, loginWithGoogle } = useAuthMethods();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');

  useEffect(() => {
    // Set error from URL parameter if present
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  useEffect(() => {
    // If user is already authenticated, redirect to the intended destination
    if (isAuthenticated && !isLoading) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router, redirectPath]);

  useEffect(() => {
    // When wallet is connected, automatically log in with the address
    if (isConnected && address && !isAuthenticated && !isAuthenticating) {
      handleWalletLogin();
    }
  }, [isConnected, address, isAuthenticated]);

  const handleWalletLogin = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      await loginWithWallet(address);
      router.push(redirectPath);
    } catch (error: any) {
      console.error('Wallet login failed:', error);
      setError(error?.response?.data?.message || 'Failed to authenticate with wallet');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      await loginWithGoogle();
      // The redirect will be handled by the Google OAuth flow
    } catch (error: any) {
      console.error('Google login failed:', error);
      setError(error?.response?.data?.message || 'Failed to initiate Google login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Please connect your wallet to continue</p>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/30 border-red-900 text-red-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-8 space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <WalletConnector />
            
            {isAuthenticating && (
              <div className="mt-4 text-white">
                <p>Authenticating...</p>
              </div>
            )}

            <div className="w-full flex items-center justify-between">
              <hr className="w-full border-gray-600" />
              <span className="px-2 text-gray-400">OR</span>
              <hr className="w-full border-gray-600" />
            </div>

            <Button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              <span>Sign in with Google</span>
            </Button>

            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
                Sign in with Email/Password
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 