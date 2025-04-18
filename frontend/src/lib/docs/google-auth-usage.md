# Google OAuth Authentication

This document explains how to use the Google OAuth authentication in the HackHazards application.

## Overview

The application provides a simple hook for managing Google OAuth authentication. The implementation uses the existing backend OAuth integration, which is configured with the Google Cloud Console and Passport.js.

## Using the Google Authentication Hook

The `useGoogleAuth` hook is designed to simplify Google authentication integration into any component:

```tsx
import { useGoogleAuth } from '@/lib/hooks/useGoogleAuth';

function MyLoginComponent() {
  const { loginWithGoogle, isLoading, error } = useGoogleAuth();
  
  return (
    <button 
      onClick={loginWithGoogle}
      disabled={isLoading}
    >
      {isLoading ? 'Logging in...' : 'Log in with Google'}
      {error && <span className="text-red-500">{error}</span>}
    </button>
  );
}
```

## Ready-to-use Google Login Button

For convenience, a pre-built `GoogleLoginButton` component is available:

```tsx
import GoogleLoginButton from '@/components/GoogleLoginButton';

function LoginPage() {
  return (
    <div>
      {/* Other login options */}
      <div className="mt-4">
        <GoogleLoginButton fullWidth />
      </div>
    </div>
  );
}
```

The button component accepts several props:
- `className`: Additional CSS classes
- `size`: Button size ('default', 'sm', 'lg')
- `variant`: Button variant ('default', 'outline', 'ghost')
- `fullWidth`: Whether the button should take full width

## Authentication Flow

1. When `loginWithGoogle()` is called, the user is redirected to the Google login page
2. After successful Google authentication, Google redirects back to our backend
3. The backend validates the user, creates/updates the account, and sets a JWT cookie
4. The user is redirected to `/auth/google/callback` in the frontend
5. The callback page verifies the authentication and redirects to the dashboard or onboarding

## Error Handling

The `useGoogleAuth` hook provides an `error` state that will contain error messages if the initial redirection fails. For errors during the OAuth process itself, errors are handled by the callback page, which will redirect to the login page with an error query parameter if authentication fails.

## User Authentication State

Once authenticated, you can use the existing `useAuth` hook to access the authenticated user's data:

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function ProfilePage() {
  const { authState } = useAuth();
  
  return (
    <div>
      {authState.isAuthenticated ? (
        <p>Welcome, {authState.user?.name}</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
``` 