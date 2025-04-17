'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOnboardingStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { OnboardingSummary } from '@/components/onboarding/OnboardingSummary';
import { OnboardingChat } from '@/components/onboarding/OnboardingChat';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth(true);
  const { 
    completed, 
    role, 
    experienceLevel, 
    setRole, 
    setExperienceLevel, 
    setCompleted 
  } = useOnboardingStore();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if onboarding already completed
  useEffect(() => {
    if (isInitialized && isAuthenticated && completed) {
      router.push('/dashboard');
    }
  }, [isInitialized, isAuthenticated, completed, router]);

  // If not authenticated, useAuth will redirect to login

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      // Mark onboarding as completed in the store
      setCompleted(true);
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isInitialized || !isAuthenticated) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to GeneForge</h1>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= i ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i}
              </div>
              <div className="text-sm mt-2">
                {i === 1 ? 'Basic Info' : i === 2 ? 'Interests' : 'Summary'}
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 mt-4 rounded-full">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          ></div>
        </div>
      </div>

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">What best describes you?</h3>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as any)}>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student">Student</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="researcher" id="researcher" />
                      <Label htmlFor="researcher">Researcher</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other">Other</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-3">Your experience level with genomics:</h3>
                <RadioGroup
                  value={experienceLevel}
                  onValueChange={(value) => setExperienceLevel(value as any)}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="beginner" />
                      <Label htmlFor="beginner">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="intermediate" />
                      <Label htmlFor="intermediate">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced">Advanced</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {step === 2 && <OnboardingChat />}

        {step === 3 && <OnboardingSummary />}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            <div></div>
          )}
          <Button onClick={handleNext} disabled={isSubmitting}>
            {step === 3 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
} 