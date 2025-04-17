import { Request, Response, CookieOptions } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import User, { IUser } from '../models/user.model';
import Profile from '../models/profile.model';
import config from '../config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { google } from 'googleapis';

// Google OAuth configuration
const oauth2Client = new google.auth.OAuth2(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URI
);

// Options for cookies
const cookieOptions: CookieOptions = {
  httpOnly: true,
  // In development, cookies should NOT be secure (http works)
  // In production, cookies must be secure (https required)
  secure: config.NODE_ENV === 'production',
  // For cross-site requests (like OAuth flows), 'none' is needed
  // But 'none' requires 'secure: true', so we need to handle differently for dev
  sameSite: config.NODE_ENV === 'development' ? 'lax' : 'none',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// When clearing cookies on logout, use the same settings
const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: config.NODE_ENV === 'development' ? 'lax' : 'none',
};

/**
 * Login or register user with wallet address
 */
export const loginWithWallet = asyncHandler(async (req: Request, res: Response) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    throw new ApiError(400, 'Wallet address is required');
  }

  // Normalize wallet address (lowercase)
  const normalizedWalletAddress = walletAddress.toLowerCase();

  // Find or create user
  let user = await User.findOne({ walletAddress: normalizedWalletAddress });
  
  if (!user) {
    // Create new user
    user = await User.create({
      walletAddress: normalizedWalletAddress,
      role: 'user',
    });

    // Create profile
    await Profile.create({
      userId: user._id,
      onboardingCompleted: false,
    });
  }

  // Generate access token
  const accessToken = user.generateAccessToken();

  // Set cookie
  res.cookie('accessToken', accessToken, cookieOptions);

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          preferences: user.preferences,
          profileImageUrl: user.profileImageUrl,
        },
        accessToken,
      },
      'User logged in successfully'
    )
  );
});

/**
 * Register user with email and password
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
    role: 'user',
  });

  // Create profile
  await Profile.create({
    userId: user._id,
    onboardingCompleted: false,
  });

  // Generate access token
  const accessToken = user.generateAccessToken();

  // Set cookie
  res.cookie('accessToken', accessToken, cookieOptions);

  // Return response without password
  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          preferences: user.preferences,
          profileImageUrl: user.profileImageUrl,
        },
        accessToken,
      },
      'User registered successfully'
    )
  );
});

/**
 * Login with email and password
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if password exists in user document
  if (!user.password) {
    throw new ApiError(400, 'Invalid login method. Try logging in with wallet instead.');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate access token
  const accessToken = user.generateAccessToken();

  // Set cookie
  res.cookie('accessToken', accessToken, cookieOptions);

  // Return response without password
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
          preferences: user.preferences,
          profileImageUrl: user.profileImageUrl,
        },
        accessToken,
      },
      'User logged in successfully'
    )
  );
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // Clear cookie using the consistent options
  res.clearCookie('accessToken', clearCookieOptions);

  // Return response
  return res.status(200).json(
    new ApiResponse(200, {}, 'User logged out successfully')
  );
});

/**
 * Get current user
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  // User should be available from auth middleware
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized request');
  }

  // Find user by ID
  const user = await User.findById(req.user.id).select('-__v -password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role,
          preferences: user.preferences,
          profileImageUrl: user.profileImageUrl,
        },
      },
      'User fetched successfully'
    )
  );
});

/**
 * Forgot password - sends a reset email with token
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal that the user doesn't exist
    return res.status(200).json(
      new ApiResponse(200, {}, 'Password reset email sent, if email exists')
    );
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash the token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiry to 10 minutes
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
  
  await user.save();

  // For a real application, send an email with the token
  // For now, just return the token in the response
  return res.status(200).json(
    new ApiResponse(
      200, 
      { resetToken }, 
      'Password reset email sent, if email exists'
    )
  );
});

/**
 * Reset password using token
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ApiError(400, 'Token and new password are required');
  }

  // Hash the token from params
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with this token and valid expiry
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired token');
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  
  // Clear reset token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  
  await user.save();

  // Return success
  return res.status(200).json(
    new ApiResponse(200, {}, 'Password reset successful')
  );
});

/**
 * Change password (when user is logged in)
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    throw new ApiError(401, 'Unauthorized request');
  }

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  // Find user by ID with password
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if password exists in user document
  if (!user.password) {
    throw new ApiError(400, 'User does not have a password set. Try setting a password first.');
  }

  // Check if current password is correct
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  
  await user.save();

  // Return success
  return res.status(200).json(
    new ApiResponse(200, {}, 'Password changed successfully')
  );
});

/**
 * Google OAuth initiate
 */
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { authUrl },
      'Google authentication URL generated'
    )
  );
});

/**
 * Google OAuth callback
 */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, 'Authorization code is required');
  }

  try {
    console.log('Processing Google auth code...');
    
    // Exchange code for tokens
    let tokens;
    try {
      const tokenResponse = await oauth2Client.getToken(code);
      tokens = tokenResponse.tokens;
      console.log('Successfully exchanged code for Google tokens');
    } catch (error: any) {
      console.error('Google token exchange error:', error?.response?.data || error);
      
      // Format a user-friendly error
      if (error?.response?.data?.error === 'invalid_grant') {
        throw new ApiError(400, 'Authentication code expired or already used');
      } else {
        throw new ApiError(400, `Google authentication failed: ${error?.response?.data?.error || error.message}`);
      }
    }
    
    if (!tokens || !tokens.access_token) {
      console.error('No tokens received from Google OAuth');
      throw new ApiError(400, 'Failed to validate Google authorization');
    }
    
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    let userInfo;
    try {
      const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
      });
      userInfo = await oauth2.userinfo.get();
      console.log('Successfully retrieved user info from Google');
    } catch (error: any) {
      console.error('Failed to get user info from Google:', error);
      throw new ApiError(400, 'Could not retrieve user information from Google');
    }
    
    console.log('Received user info from Google:', 
      userInfo.data.email ? `${userInfo.data.email} (email)` : 'No email',
      userInfo.data.name ? 'name provided' : 'no name'
    );
    
    const googleEmail = userInfo.data.email;
    const googleId = userInfo.data.id;
    
    if (!googleEmail) {
      throw new ApiError(400, 'Email is required from Google account');
    }
    if (!googleId) {
      throw new ApiError(400, 'Google ID is required from Google account');
    }

    let user: IUser | null = null;

    // 1. Try to find user by Google ID first
    user = await User.findOne({ googleId });

    if (!user) {
      // 2. If not found by Google ID, try finding by email
      console.log(`User not found by googleId ${googleId}. Trying by email ${googleEmail}...`);
      user = await User.findOne({ email: googleEmail });

      if (user) {
        // 3. User found by email - link Google ID
        console.log('Found existing user by email. Linking googleId...');
        user.googleId = googleId;
        // Optionally update name/picture if missing or different
        if (!user.name && userInfo.data.name) user.name = userInfo.data.name;
        if (!user.profileImageUrl && userInfo.data.picture) user.profileImageUrl = userInfo.data.picture;
        
        await user.save();
        console.log('Updated existing user with Google ID');
      } else {
        // 4. User not found by Google ID or email - create new user
        console.log('User not found by email either. Creating new user for Google auth...');
        try {
          user = await User.create({
            googleId,
            email: googleEmail,
            name: userInfo.data.name || '',
            role: 'user',
            profileImageUrl: userInfo.data.picture || '',
          });

          // Create profile for the new user
          await Profile.create({
            userId: user._id,
            onboardingCompleted: false,
          });
          
          console.log('Successfully created new user and profile');
        } catch (error: any) {
          console.error('Error creating user during Google auth:', error);
          if (error.code === 11000) { // MongoDB duplicate key error
            // This *shouldn't* happen with the checks above, but handle defensively
            throw new ApiError(409, 'An account conflict occurred. Please try logging in differently or contact support.');
          } else {
            throw new ApiError(500, 'Failed to create user account during Google auth');
          }
        }
      }
    } else {
      // User found by Google ID - ensure email matches if provided
      console.log('Found existing user by googleId:', user.email);
      if (user.email !== googleEmail) {
         // Optional: Handle email mismatch scenario (e.g., log warning, update email, or throw error depending on policy)
         console.warn(`Google ID ${googleId} logged in, but email mismatch: DB has ${user.email}, Google has ${googleEmail}`);
         // For now, we'll allow login but you might want a stricter policy here
         // Example: Update email if it's not set in DB
         // if (!user.email) { user.email = googleEmail; await user.save(); }
      }
    }

    // If we somehow still don't have a user object, something went wrong
    if (!user) {
      console.error('User object is null after Google auth logic');
      throw new ApiError(500, 'Authentication process failed unexpectedly.');
    }

    // Load user profile to check onboarding status
    await user.populate('profile');
    console.log('User profile populated, onboarding status:', user.profile?.onboardingCompleted);

    // Generate access token
    const accessToken = user.generateAccessToken();
    console.log('Generated JWT access token for user');

    // Set cookie with proper options for the environment
    console.log(`Setting authentication cookie (NODE_ENV: ${config.NODE_ENV}):`, {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      httpOnly: cookieOptions.httpOnly
    });
    
    // Set cookie
    res.cookie('accessToken', accessToken, cookieOptions);
    
    // Log headers for debugging
    console.log('Response headers set:', res.getHeaders());

    // Return response with token in body as well (fallback mechanism)
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
            walletAddress: user.walletAddress,
            role: user.role,
            preferences: user.preferences,
            profileImageUrl: user.profileImageUrl || userInfo.data.picture,
            onboardingCompleted: user.profile?.onboardingCompleted
          },
          accessToken, // Include token in response body as fallback
        },
        'User logged in successfully with Google'
      )
    );
  } catch (error) {
    console.error('Google auth error:', error);
    if (error instanceof ApiError) {
      throw error; // Re-throw our formatted errors
    } else {
      throw new ApiError(500, 'Failed to authenticate with Google');
    }
  }
}); 