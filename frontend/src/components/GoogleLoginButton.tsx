'use client';

import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

interface GoogleLoginButtonProps {
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export default function GoogleLoginButton({
  className = '',
  size = 'default',
  variant = 'outline',
  fullWidth = false,
}: GoogleLoginButtonProps) {
  const { loginWithGoogle, isLoading, error } = useGoogleAuth();

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={loginWithGoogle}
        disabled={isLoading}
        className={`${className} ${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2`}
        size={size}
        variant={variant}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
        ) : (
          <FcGoogle className="h-5 w-5" />
        )}
        {isLoading ? 'Connecting...' : 'Continue with Google'}
      </Button>
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}