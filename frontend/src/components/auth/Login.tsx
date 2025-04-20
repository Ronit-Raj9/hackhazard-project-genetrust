'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState, useAuthMethods, authEvents } from '@/lib/hooks/useAuth';
import { useAccount } from 'wagmi';
import WalletConnector from '@/components/chainSight/WalletConnector';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleLogin } from '@react-oauth/google';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Login() {
  const { user, isLoading, isAuthenticated } = useAuthState();
  const { login, loginWithWallet, loginWithGoogle } = useAuthMethods();
  const { address, isConnected } = useAccount();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/dashboard';
  const errorParam = searchParams?.get('error');
  const [activeTab, setActiveTab] = useState('wallet');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

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
    if (isConnected && address && !isAuthenticated && !isAuthenticating && activeTab === 'wallet') {
      handleWalletLogin();
    }
  }, [isConnected, address, isAuthenticated, activeTab]);

  const handleWalletLogin = async () => {
    if (!address) return;
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      console.log('Attempting wallet login with address:', address);
      
      const result = await loginWithWallet(address);
      console.log('Wallet login successful, redirecting to:', redirectPath);
      
      // Emit auth state change event to ensure all components update
      if (typeof window !== 'undefined' && window.authEvents) {
        window.authEvents.emit('auth_state_changed', { isAuthenticated: true });
      }
      
      // Short delay before redirect to allow state to update
      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
      
      return result;
    } catch (error: any) {
      console.error('Wallet login failed:', error);
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to authenticate with wallet';
      
      if (error?.response?.status === 404) {
        errorMessage = 'Account not found. Please register this wallet first.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please try again.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setIsAuthenticating(true);
      setError(null);
      
      console.log('Attempting email login for:', email);
      await login(email, password);
      
      // Emit auth state change event to ensure all components update
      authEvents.emit('auth_state_changed', { isAuthenticated: true });
      
      // Small delay before redirect
      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
      
    } catch (error: any) {
      console.error('Email login failed:', error);
      
      let errorMessage = 'Failed to sign in with email/password';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Invalid email or password';
      } else if (error?.response?.status === 404) {
        errorMessage = 'Account not found. Please register first.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = async (response: any) => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      console.log('Google login response received:', response);
      
      if (!response || !response.credential) {
        throw new Error('Invalid Google response');
      }
      
      const idToken = response.credential;
      
      // Decode the JWT to get email and name
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const { email, name } = payload;
      
      console.log('Attempting Google login for:', email);
      await loginWithGoogle(idToken, email, name);
      
      // Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, ${name || email}`,
        duration: 3000,
      });
      
      // Emit auth state change event
      authEvents.emit('auth_state_changed', { isAuthenticated: true });
      
      // Small delay before redirect
      setTimeout(() => {
        router.push(redirectPath);
      }, 100);
      
    } catch (error: any) {
      console.error('Google login failed:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      
      if (error?.response?.status === 401) {
        errorMessage = 'Google authentication failed';
      } else if (error?.response?.status === 409) {
        errorMessage = 'An account with this email already exists. Please use password login.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white text-center">Welcome Back</CardTitle>
          <CardDescription className="text-gray-400 text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-900 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="wallet" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="wallet" className="space-y-6">
              <div className="flex flex-col items-center">
                <WalletConnector />
                
                {isAuthenticating && (
                  <div className="mt-4 text-white flex items-center space-x-2">
                    <div className="h-4 w-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    <p>Authenticating with wallet...</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="h-4 w-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    'Sign in with Email'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-800 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  console.error('Google login failed');
                  setError('Google login failed. Please try again.');
                }}
                useOneTap
                theme="filled_blue"
                text="signin_with"
                shape="circle"
                locale="en"
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign up
            </Link>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-200 hover:bg-gray-700"
            onClick={() => {
              router.push('/login/guest');
            }}
          >
            Continue as Guest
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 