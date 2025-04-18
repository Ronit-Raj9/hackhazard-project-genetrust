import { Router } from 'express';
import { 
  handleChatCompletion, 
  getGuidance, 
  handleOnboardingChat,
  analyzeVisionScene,
  transcribeAudio,
  interpretCommand 
} from '../../controllers/groq.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// Public routes (for onboarding)
router.post('/onboarding-chat', handleOnboardingChat);

// Protected routes
router.post('/chat', verifyJWT, handleChatCompletion);
router.get('/blockchain-guidance', verifyJWT, getGuidance);

// New multimodal Groq routes
router.post('/analyze-vision', verifyJWT, analyzeVisionScene);
router.post('/transcribe', verifyJWT, transcribeAudio);
router.post('/interpret-command', verifyJWT, interpretCommand);

export default router; 