import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { 
  login,
  loginWithWallet, 
  logout,
  register,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
} from '../../controllers/auth.controller';
import { verifyJWT } from '../../middleware/auth';
import { IUser } from '../../models/user.model';
import config from '../../config';
import { CookieOptions } from 'express';

const router = Router();

// Cookie options
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.NODE_ENV === 'production',
  sameSite: config.NODE_ENV === 'development' ? 'lax' : 'none',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

// Public routes
router.post('/login', login);
router.post('/login/wallet', loginWithWallet);
router.post('/register', register);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${config.FRONTEND_URL}/login?error=google_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      const user = req.user as IUser;
      
      if (!user) {
        return res.redirect(`${config.FRONTEND_URL}/login?error=authentication_failed`);
      }
      
      // Generate JWT token
      const accessToken = user.generateAccessToken();
      
      // Set cookie
      res.cookie('accessToken', accessToken, cookieOptions);
      
      // Determine redirect based on onboarding status
      // Default to dashboard - the frontend will check onboarding status
      res.redirect(`${config.FRONTEND_URL}/auth/google/callback`);
    } catch (error) {
      console.error('Error in Google callback handler:', error);
      res.redirect(`${config.FRONTEND_URL}/login?error=unexpected_error`);
    }
  }
);

// Protected routes
router.get('/me', verifyJWT, getCurrentUser);
router.post('/change-password', verifyJWT, changePassword);

export default router; 