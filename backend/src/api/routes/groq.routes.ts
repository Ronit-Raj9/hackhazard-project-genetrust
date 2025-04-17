import { Router } from 'express';
import { 
  handleChatCompletion, 
  getGuidance, 
  handleOnboardingChat 
} from '../../controllers/groq.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// Public routes (for onboarding)
router.post('/onboarding-chat', handleOnboardingChat);

// Protected routes
router.post('/chat', verifyJWT, handleChatCompletion);
router.get('/blockchain-guidance', verifyJWT, getGuidance);

export default router; 