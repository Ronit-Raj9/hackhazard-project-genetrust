'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useOnboardingStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { OnboardingSummary } from '@/components/onboarding/OnboardingSummary';
import { OnboardingChat } from '@/components/onboarding/OnboardingChat';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Dna, Sparkles, CheckCircle2 } from 'lucide-react';

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
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-cyan-500 border-b-purple-500 border-l-transparent animate-spin"></div>
            <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-indigo-400 border-b-cyan-400 border-l-purple-400 animate-spin animation-delay-200 animate-reverse"></div>
          </div>
          <p className="mt-4 text-indigo-300 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-[url('/grid-pattern.svg')] bg-fixed pb-20">
      <div className="container max-w-4xl mx-auto px-4 pt-20">
        {/* Header with glow effect */}
        <div className="relative mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 relative z-10">
            Welcome to 
            <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">GeneTrust</span>
          </h1>
          <p className="text-indigo-300 text-lg max-w-xl mx-auto">
            Let's customize your experience to help you get the most out of our platform
          </p>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl -z-10"></div>
        </div>
        
        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[
              { num: 1, title: 'Basic Info', icon: <Dna className="h-5 w-5" /> },
              { num: 2, title: 'Interests', icon: <Sparkles className="h-5 w-5" /> },
              { num: 3, title: 'Summary', icon: <CheckCircle2 className="h-5 w-5" /> }
            ].map((item) => (
              <div key={item.num} className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * item.num }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    step >= item.num 
                      ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300' 
                      : 'bg-gray-800/50 border-gray-700 text-gray-400'
                  } ${step === item.num ? 'ring-2 ring-indigo-500/50' : ''}`}
                >
                  <div className="flex items-center justify-center">
                    {item.num < step ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                    ) : (
                      <div className="flex items-center justify-center">
                        <div className="hidden sm:block">{item.icon}</div>
                        <div className="sm:hidden">{item.num}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
                <div className="text-sm mt-2 font-medium text-indigo-300/80">
                  {item.title}
                </div>
              </div>
            ))}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-800 h-1.5 mt-6 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500"
            ></motion.div>
          </div>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-indigo-800/30 bg-gray-900/80 backdrop-blur-sm shadow-lg shadow-indigo-900/20">
              <CardContent className="p-8">
                {step === 1 && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-white">Tell us about yourself</h2>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-3 text-indigo-300">What best describes you?</h3>
                        <RadioGroup value={role} onValueChange={(value) => setRole(value as any)} className="space-y-3">
                          {[
                            { id: 'student', label: 'Student', description: 'Learning about genomics' },
                            { id: 'researcher', label: 'Researcher', description: 'Professional research work' },
                            { id: 'other', label: 'Other', description: 'Just exploring' }
                          ].map((option) => (
                            <label
                              key={option.id}
                              htmlFor={option.id}
                              className={`flex items-start p-4 rounded-lg cursor-pointer border transition-all duration-200 ${
                                role === option.id
                                  ? 'bg-indigo-900/30 border-indigo-500 shadow-md'
                                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-center h-5">
                                <RadioGroupItem value={option.id} id={option.id} className="border-indigo-400" />
                              </div>
                              <div className="ml-3">
                                <div className="text-base font-medium text-white">{option.label}</div>
                                <div className="text-sm text-indigo-300/70">{option.description}</div>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-3 text-indigo-300">Your experience level with genomics:</h3>
                        <RadioGroup
                          value={experienceLevel}
                          onValueChange={(value) => setExperienceLevel(value as any)}
                          className="space-y-3"
                        >
                          {[
                            { id: 'beginner', label: 'Beginner', description: 'New to the field' },
                            { id: 'intermediate', label: 'Intermediate', description: 'Some experience' },
                            { id: 'advanced', label: 'Advanced', description: 'Expert level knowledge' }
                          ].map((option) => (
                            <label
                              key={option.id}
                              htmlFor={option.id}
                              className={`flex items-start p-4 rounded-lg cursor-pointer border transition-all duration-200 ${
                                experienceLevel === option.id
                                  ? 'bg-indigo-900/30 border-indigo-500 shadow-md'
                                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-center h-5">
                                <RadioGroupItem value={option.id} id={option.id} className="border-indigo-400" />
                              </div>
                              <div className="ml-3">
                                <div className="text-base font-medium text-white">{option.label}</div>
                                <div className="text-sm text-indigo-300/70">{option.description}</div>
                              </div>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && <OnboardingChat />}

                {step === 3 && <OnboardingSummary onEdit={() => setStep(1)} />}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button 
                      variant="outline" 
                      onClick={handleBack} 
                      disabled={isSubmitting}
                      className="border-indigo-600/30 bg-indigo-900/20 hover:bg-indigo-800/30 text-indigo-300"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}
                  
                  {step !== 3 && (
                    <Button 
                      onClick={handleNext} 
                      disabled={isSubmitting || !role || !experienceLevel}
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 