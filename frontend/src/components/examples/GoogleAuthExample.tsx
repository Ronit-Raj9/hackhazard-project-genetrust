'use client';

import { Divider } from '@/components/ui/divider';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleAuthExample() {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Regular login form would go here */}
          <div className="grid gap-4">
            {/* Regular form inputs */}
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Divider className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <GoogleLoginButton fullWidth />
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 