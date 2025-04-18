# Authentication System Documentation

## Overview

The authentication system in this application handles multiple authentication methods:

1. **Wallet Authentication**: Users can connect their crypto wallets (via RainbowKit/Wagmi)
2. **Google OAuth**: Users can sign in with their Google accounts
3. **Email/Password**: Traditional username and password authentication

## Files Structure

- **`/lib/contexts/AuthContext.tsx`**: Main authentication context definitions
- **`/lib/contexts/AuthProvider.tsx`**: Implementation of the authentication provider
- **`/lib/hooks/useAuth.ts`**: Main authentication hook implementation with all auth methods
- **`/components/auth/PrivateRoute.tsx`**: Route protection component
- **`/components/auth/Login.tsx`**: Main login component with wallet and Google auth
- **`/app/auth/google/callback/page.tsx`**: Google OAuth callback handler

## Authentication Flow

### Wallet Authentication

1. User connects their wallet using the `WalletConnector` component
2. The `Login` component detects the connected wallet with `useAccount` hook from Wagmi
3. It calls `loginWithWallet` from `useAuthMethods` with the address
4. The backend verifies or creates the user account associated with the wallet address
5. User is authenticated and a JWT token is stored in both cookies and localStorage (as fallback)

### Google Authentication

1. User clicks "Sign in with Google" button
2. The frontend calls `loginWithGoogle` which initiates OAuth flow with backend
3. User is redirected to Google for authentication
4. Google redirects back to the `/auth/google/callback` route with an auth code
5. The callback page sends the code to the backend
6. Backend exchanges code for tokens with Google, verifies the user, and returns JWT
7. User is authenticated and redirected based on their onboarding status

### Email/Password Authentication

1. User enters credentials on the login form
2. Frontend calls `login` method with email and password
3. Backend verifies credentials and returns JWT token
4. User is authenticated and redirected to dashboard

## How to Use

### Accessing Authentication in Components

Use the `useAuth` hook (or individual hooks) in your components:

```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return isAuthenticated 
    ? <div>Welcome, {user?.name}!</div>
    : <div>Please login</div>;
}
```

For more granular control, use the specialized hooks:

```tsx
import { useAuthState, useAuthMethods } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated } = useAuthState();
  const { logout, loginWithGoogle } = useAuthMethods();
  
  // Use auth methods and state as needed
}
```

### Protecting Routes

Use the `PrivateRoute` component to protect routes that require authentication:

```tsx
import PrivateRoute from '@/components/auth/PrivateRoute';

export default function DashboardPage() {
  return (
    <PrivateRoute>
      <div>Dashboard content (only visible to authenticated users)</div>
    </PrivateRoute>
  );
}
```

Alternatively, use the HOC pattern:

```tsx
import { withAuth } from '@/components/auth/PrivateRoute';

function DashboardComponent() {
  return <div>Dashboard content</div>;
}

export default withAuth(DashboardComponent);
```

## Error Handling

Authentication errors are stored in the auth context and can be accessed with the `useAuthState` hook:

```tsx
const { error } = useAuthState();

if (error) {
  return <div>Error: {error}</div>;
}
```

## Backend Integration

The authentication system communicates with the backend API through methods defined in `/lib/api.ts`. 
The API uses both cookie-based authentication (httpOnly cookies) and token-based authentication 
(stored in localStorage as fallback) for maximum compatibility. 