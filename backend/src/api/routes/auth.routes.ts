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
import logger from '../../utils/logger';

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
router.get('/google', (req, res, next) => {
  logger.info('Google OAuth login initiated');
  logger.info(`Redirect URI: ${config.GOOGLE_REDIRECT_URI}`);
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })(req, res, next);
});

router.get('/google/callback', 
  (req, res, next) => {
    logger.info('Google OAuth callback received');
    passport.authenticate('google', { 
      failureRedirect: `${config.FRONTEND_URL}/login?error=google_auth_failed`,
      session: false
    })(req, res, next);
  },
  (req, res) => {
    try {
      logger.info('Google OAuth authentication successful, generating token');
      const user = req.user as IUser;
      
      if (!user) {
        logger.error('No user found in request after Google authentication');
        return res.redirect(`${config.FRONTEND_URL}/login?error=authentication_failed`);
      }
      
      // Generate JWT token
      logger.info(`Generating access token for user: ${user._id}`);
      const accessToken = user.generateAccessToken();
      
      // Set cookie
      logger.info('Setting access token cookie');
      res.cookie('accessToken', accessToken, cookieOptions);
      logger.info(`Cookie settings: httpOnly=${cookieOptions.httpOnly}, secure=${cookieOptions.secure}, sameSite=${cookieOptions.sameSite}`);
      
      // Redirect to frontend callback page
      const redirectUrl = config.FRONTEND_REDIRECT_URI;
      logger.info(`Redirecting to frontend: ${redirectUrl}`);
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Error in Google callback handler:', error);
      res.redirect(`${config.FRONTEND_URL}/login?error=unexpected_error`);
    }
  }
);

// Protected routes
router.get('/me', verifyJWT, getCurrentUser);
router.post('/change-password', verifyJWT, changePassword);

export default router; 