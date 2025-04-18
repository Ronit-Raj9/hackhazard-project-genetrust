'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { authAPI } from '@/lib/api';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  // Check for error in the URL - could be redirected here with an error param
  useEffect(() => {
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setStatus('Authentication Error');
      setError(decodeURIComponent(errorParam));
      console.error('Error in URL params:', errorParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // This function handles the Google OAuth callback after the backend has processed it
    const handleGoogleCallback = async () => {
      // Skip if there's already an error or if already processing
      if (error || processingRef.current) {
        console.log('Already processing OAuth callback or error exists, skipping');
        return;
      }
      
      processingRef.current = true;
      setIsProcessing(true);
      
      try {
        console.log('Starting Google OAuth callback verification');
        setStatus('Verifying authentication...');
        
        // The backend has already set the JWT cookie during the OAuth flow,
        // so we just need to get the current user to verify it worked
        try {
          console.log('Calling getCurrentUser to verify authentication');
          const userResponse = await authAPI.getCurrentUser();
          console.log('Authentication verification successful, user data:', 
            userResponse?.data?.data?.user?.id ? 'User ID: ' + userResponse.data.data.user.id : 'No user ID');
          
          // Get onboarding status
          const onboardingCompleted = userResponse?.data?.data?.user?.onboardingCompleted || false;
          console.log('Onboarding status:', onboardingCompleted ? 'Completed' : 'Not completed');
          
          // Redirect based on onboarding status
          if (onboardingCompleted) {
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
          } else {
            console.error('Network error or no response object:', verifyErr.message);
          }
          
          setStatus('Authentication verification failed');
          setError(verifyErr.response?.data?.message || 'Could not verify your login status. Please try again.');
          setTimeout(() => router.push('/login?error=Authentication%20verification%20failed'), 3000);
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
    if (!processingRef.current && !error) {
      handleGoogleCallback();
    }
    
    // Cleanup function
    return () => {
      // We intentionally do not reset processingRef to prevent duplicate attempts
    };
  }, [router, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-white">Google Authentication</h1>
        {!error && (
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        )}
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