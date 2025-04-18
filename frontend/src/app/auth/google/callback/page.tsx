'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authAPI } from '@/lib/api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    // This function will only execute once per code
    const handleGoogleCallback = async () => {
      // Use ref to prevent concurrent execution even across re-renders
      if (processingRef.current) {
        console.log('Already processing OAuth callback, skipping');
        return;
      }
      
      processingRef.current = true;
      setIsProcessing(true);
      
      try {
        setStatus('Getting authorization code...');
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        // Handle errors returned by Google
        if (error) {
          console.error('Google returned an error:', error);
          setStatus('Google authentication failed');
          setError(`Google error: ${error}`);
          setTimeout(() => router.push(`/login?error=${encodeURIComponent(error)}`), 2000);
          return;
        }
        
        if (!code) {
          setStatus('No authorization code found');
          setError('Missing authorization code from Google');
          setTimeout(() => router.push('/login?error=Missing%20authorization%20code'), 2000);
          return;
        }
        
        setStatus('Verifying with Google...');
        console.log('Processing Google authentication code...');
        
        try {
          // Send the code to our backend
          const response = await authAPI.handleGoogleCallback(code);
          console.log('Google authentication successful:', response.data.message);
          
          // Check if we have a token in the response
          const token = response?.data?.data?.accessToken;
          if (token) {
            console.log('Token received from backend, saved to localStorage as fallback');
          } else {
            console.warn('No token found in Google callback response, relying on HTTP cookies');
          }
          
          // Manually check authentication after Google login
          try {
            const userResponse = await authAPI.getCurrentUser();
            console.log('Authentication verification successful');
            
            // Get onboarding status - safely access properties
            const isOnboarded = userResponse?.data?.data?.user?.onboardingCompleted;
            
            // Redirect based on onboarding status
            if (isOnboarded) {
              setStatus('Success! Redirecting to dashboard...');
              setTimeout(() => router.push('/dashboard'), 1000);
            } else {
              setStatus('Success! Redirecting to onboarding...');
              setTimeout(() => router.push('/onboarding'), 1000);
            }
          } catch (verifyErr: any) {
            console.error('Failed to verify authentication after Google login:', verifyErr);
            
            // Log more details about the error
            if (verifyErr.response) {
              console.error('Response status:', verifyErr.response.status);
              console.error('Response data:', verifyErr.response.data);
            }
            
            setStatus('Authentication verification failed');
            setError(verifyErr.response?.data?.message || 'Could not verify your login status. Please try again.');
            setTimeout(() => router.push('/login?error=Authentication%20verification%20failed'), 3000);
          }
        } catch (err: any) {
          console.error('Google callback error:', err);
          let errorMessage = 'Failed to authenticate with Google';
          
          // Extract specific error messages
          if (err.response?.data?.message) {
            errorMessage = err.response.data.message;
          } else if (err.message?.includes('invalid_grant')) {
            errorMessage = 'Authentication code expired or already used';
          } else if (err.message?.includes('user exists')) {
            errorMessage = 'An account with this email already exists';
          }
          
          setStatus('Authentication failed');
          setError(errorMessage);
          
          // Redirect after showing the error
          setTimeout(() => router.push(`/login?error=${encodeURIComponent(errorMessage)}`), 3000);
        }
      } catch (err: any) {
        console.error('Error in callback processing:', err);
        setStatus('Authentication processing failed');
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTimeout(() => router.push('/login?error=Authentication%20failed'), 3000);
      } finally {
        setIsProcessing(false);
        // Keep processingRef true to prevent subsequent attempts
      }
    };

    // Only run if not already processing
    if (!processingRef.current) {
      handleGoogleCallback();
    }
    
    // Cleanup function
    return () => {
      // We intentionally do not reset processingRef to prevent duplicate attempts
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-white">Google Authentication</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="mt-4 text-gray-300">{status}</p>
        {error && (
          <div className="mt-4 p-3 bg-red-900/30 text-red-300 rounded-md border border-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 