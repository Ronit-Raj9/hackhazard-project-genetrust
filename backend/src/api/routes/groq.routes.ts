import { Router } from 'express';
import { 
  handleChatCompletion, 
  getGuidance, 
  handleOnboardingChat,
  // Commenting out unused imports to fix build errors
  // getChatHistory,
  analyzeVisionScene,
  transcribeAudio,
  interpretCommand,
  getSensorDataInsights
} from '../../controllers/groq.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// Public routes (for onboarding)
router.post('/onboarding-chat', handleOnboardingChat);
// Commenting out routes with missing controller functions
// router.get('/chat-history/:sessionId', getChatHistory);

// Health check route for Groq connectivity
router.get('/health', (req, res) => {
  // Get Groq status from the module
  const groqServiceModule = require('../../services/groq.service');
  const isGroqAvailable = groqServiceModule.isApiKeyValid && groqServiceModule.groqClient !== null;
  
  console.log('Groq health check:', isGroqAvailable ? 'Connected' : 'Disconnected');
  
  return res.status(200).json({
    status: 'success',
    groq: {
      connected: isGroqAvailable,
      message: isGroqAvailable ? 'Groq API connected' : 'Groq API not connected - check API key configuration'
    }
  });
});

// Protected routes
router.post('/chat', verifyJWT, handleChatCompletion);
router.get('/blockchain-guidance', verifyJWT, getGuidance);

// Lab monitoring routes
router.post('/analyze-vision', verifyJWT, analyzeVisionScene);
router.post('/transcribe', verifyJWT, transcribeAudio);
router.post('/interpret-command', verifyJWT, interpretCommand);
router.post('/sensor-insights', verifyJWT, getSensorDataInsights);

export default router; 