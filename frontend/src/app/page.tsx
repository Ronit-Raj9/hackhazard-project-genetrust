'use client';

// Force dynamic rendering to avoid build-time errors
export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/landing/LandingPage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOnboardingStore } from '@/lib/store';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  const { completed } = useOnboardingStore();

  useEffect(() => {
    // Redirect authenticated users to the dashboard or onboarding
    if (isInitialized && isAuthenticated) {
      console.log('User is authenticated, redirecting from home page');
      if (completed) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, completed, router, isInitialized]);

  // Show landing page only for non-authenticated users or while still initializing
  return <LandingPage />;
}
