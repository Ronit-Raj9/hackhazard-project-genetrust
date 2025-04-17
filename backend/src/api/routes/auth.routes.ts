import { Router } from 'express';
import { 
  login,
  loginWithWallet, 
  logout,
  register,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  changePassword,
  googleAuth,
  googleCallback
} from '../../controllers/auth.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/login/wallet', loginWithWallet);
router.post('/register', register);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth routes
router.get('/google', googleAuth);
router.post('/google/callback', googleCallback);

// Protected routes
router.get('/me', verifyJWT, getCurrentUser);
router.post('/change-password', verifyJWT, changePassword);

export default router; 