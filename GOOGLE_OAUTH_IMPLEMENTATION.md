# Google OAuth 2.0 Integration Guide

This document outlines the implementation of Google OAuth 2.0 authentication in the Hackhazards application, including setup, configuration, and troubleshooting tips.

## Overview

The authentication system integrates Google OAuth 2.0 with our existing JWT-based authentication system, allowing users to:

1. Sign up using their Google account
2. Log in using their Google account
3. Link existing accounts with Google

The system maintains email uniqueness across both authentication methods (Google OAuth and email/password).

## Implementation Components

### Backend

1. **Passport.js Integration**: Using `passport-google-oauth20` strategy for handling Google authentication.
2. **User Model**: Extended to support Google authentication with:
   - `googleId` field (unique, sparse index)
   - `authProvider` field to track authentication method
   - Pre-save middleware to automatically set the auth provider

3. **Authentication Flow**:
   - Initial redirect to Google authentication page
   - Google redirects back to our callback URL
   - Backend validates and creates/links user account
   - Issues our application JWT stored in HTTP-only cookie

### Frontend

1. **Authentication API**: Updated to handle Google OAuth flow
2. **Login Component**: Includes "Login with Google" button
3. **Callback Handler**: Processes the Google authentication result and redirects to the appropriate page

## Configuration

### Google Cloud Console Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Navigate to "APIs & Services" -> "Credentials"
4. Create "OAuth client ID" with:
   - Application type: "Web application"
   - Name: "HackHazards Auth"
   - Authorized JavaScript origins: `http://localhost:3000` (for development)
   - Authorized redirect URIs: `http://localhost:8000/api/auth/google/callback`

5. Configure the OAuth consent screen with:
   - User Type: External
   - Application name, logo, etc.
   - Scopes: `email`, `profile`

### Environment Variables

The following environment variables must be set in the backend `.env` file:

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

## Testing the Integration

1. Start the backend server: `cd backend && npm run dev`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Click the "Login with Google" button
5. Complete the Google authentication process
6. You should be redirected back to the application dashboard (or onboarding if it's a new account)

## Troubleshooting

### Common Issues

1. **"Error: redirect_uri_mismatch"**
   - Ensure the redirect URI in Google Cloud Console exactly matches your backend callback URL
   - Check that your `.env` file has the correct `GOOGLE_REDIRECT_URI`

2. **Cookie Issues**
   - Ensure `sameSite`, `secure`, and other cookie options are correctly set for your environment
   - In development, cookies should have `secure: false` and `sameSite: 'lax'`
   - In production, cookies should have `secure: true` and `sameSite: 'none'`

3. **Authentication Failure After Google Login**
   - Check server logs for JWT generation or verification errors
   - Verify that the frontend callback page is correctly calling `getCurrentUser()`

### Debugging

1. Look for detailed logs in the backend console
2. Check browser Console and Network tabs for frontend issues
3. Inspect cookies in browser DevTools -> Application -> Cookies

## Security Considerations

1. JWT tokens are stored in HTTP-only cookies for enhanced security
2. Email uniqueness is enforced to prevent account duplication
3. Account linking happens automatically when a Google account matches an existing email

## Future Improvements

1. Add more oauth providers (GitHub, Apple, etc.)
2. Implement explicit account linking/unlinking UI
3. Add refresh token support for long-lived sessions

## References

- [Passport.js Google OAuth 2.0 Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Authentication Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/) 