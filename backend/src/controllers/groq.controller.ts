import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { 
  chatCompletion, 
  getBlockchainGuidance, 
  analyzeLabImage, 
  transcribeLabAudio, 
  interpretLabCommand 
} from '../services/groq.service';
import User from '../models/user.model';

// Extended request with typed user property
interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    email?: string;
    walletAddress?: string;
    role?: string;
  };
}

/**
 * Chat completion with Groq
 */
export const handleChatCompletion = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;

  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, 'Valid messages array is required');
  }

  // Get chat completion
  const completion = await chatCompletion(messages);

  if (!completion.success) {
    throw new ApiError(500, 'Failed to get response from Groq');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        message: completion.message,
        usage: completion.usage,
      },
      'Chat completion successful'
    )
  );
});

/**
 * Get blockchain guidance based on user data type preference
 */
export const getGuidance = asyncHandler(async (req: Request, res: Response) => {
  // User should be available from auth middleware
  if (!req.user) {
    throw new ApiError(401, 'Unauthorized request');
  }

  // Type assertion to get proper TypeScript support
  const authReq = req as AuthenticatedRequest;

  // Check if wallet address exists on the user object
  if (!authReq.user.walletAddress) {
    throw new ApiError(400, 'Wallet address not found for user. Cannot get blockchain guidance.');
  }

  const { dataType } = req.query;

  // Validate data type
  if (!dataType || (dataType !== 'prediction' && dataType !== 'monitoring')) {
    throw new ApiError(400, 'Valid data type is required (prediction or monitoring)');
  }

  // Get blockchain guidance
  const guidance = await getBlockchainGuidance(
    authReq.user.walletAddress,
    dataType as 'prediction' | 'monitoring'
  );

  if (!guidance.success) {
    throw new ApiError(500, 'Failed to get guidance from Groq');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        guidance: guidance.message,
      },
      'Blockchain guidance fetched successfully'
    )
  );
});

/**
 * Handle onboarding chat
 */
export const handleOnboardingChat = asyncHandler(async (req: Request, res: Response) => {
  const { message, history } = req.body;

  // Validate message
  if (!message) {
    throw new ApiError(400, 'Message is required');
  }

  // Define message types for proper typing
  type MessageRole = 'system' | 'user' | 'assistant';
  
  interface ChatMessage {
    role: MessageRole;
    content: string;
  }

  // Prepare messages array
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are GeneTrust AI Assistant, an onboarding guide for the GeneTrust AI Studio platform. Your goal is to understand the user\'s background and preferences to personalize their experience. Ask about their role (student, researcher), experience level with CRISPR, and specific interests. Keep your responses friendly, concise, and helpful. Don\'t overwhelm with too much information at once.',
    },
  ];

  // Add history messages if provided
  if (history && Array.isArray(history)) {
    messages.push(...history);
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: message,
  });

  // Get chat completion
  const completion = await chatCompletion(messages);

  if (!completion.success) {
    throw new ApiError(500, 'Failed to get response from Groq');
  }

  // Extract user profile information from conversation (simplified example)
  let role = 'student';
  let experienceLevel = 'beginner';
  const interests: string[] = [];

  // Very basic extraction logic (in a real system, this would be more sophisticated)
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('researcher') || lowerMessage.includes('scientist')) {
    role = 'researcher';
  }
  if (lowerMessage.includes('advanced') || lowerMessage.includes('expert')) {
    experienceLevel = 'advanced';
  } else if (lowerMessage.includes('intermediate')) {
    experienceLevel = 'intermediate';
  }

  // Check for mentioned interests
  const interestKeywords = ['gene editing', 'crispr', 'biology', 'science', 'dna', 'research'];
  interestKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      interests.push(keyword);
    }
  });

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        message: completion.message,
        profileData: {
          role,
          experienceLevel,
          interests,
        },
      },
      'Onboarding chat response successful'
    )
  );
});

/**
 * Analyze a vision scene (simulated) using Groq
 */
export const analyzeVisionScene = asyncHandler(async (req: Request, res: Response) => {
  const { scenario } = req.body;

  // Validate scenario
  if (!scenario) {
    throw new ApiError(400, 'Scenario identifier is required');
  }

  // Only accept specific scenarios for simulation purposes
  if (!['normal_lab', 'spill_detected', 'no_gloves', 'contamination_risk', 'equipment_misuse'].includes(scenario)) {
    throw new ApiError(400, 'Invalid scenario identifier');
  }

  // Get alert for the scenario
  const result = await analyzeLabImage(scenario);

  if (!result.success) {
    throw new ApiError(500, 'Failed to analyze lab scene');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        scenario,
        alert: result.message,
        severity: result.severity,
      },
      'Lab scene analysis completed'
    )
  );
});

/**
 * Transcribe audio from the lab using Groq
 * Note: In a real implementation, you would process an actual audio file
 * For this demo, we'll use a simulation approach with predefined texts
 */
export const transcribeAudio = asyncHandler(async (req: Request, res: Response) => {
  const { audioCommand } = req.body;

  // Validate input format (for simulation)
  if (!audioCommand) {
    throw new ApiError(400, 'Audio command identifier is required');
  }

  // Get transcription
  const result = await transcribeLabAudio(audioCommand);

  if (!result.success) {
    throw new ApiError(500, 'Failed to transcribe audio');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        transcription: result.transcription
      },
      'Audio transcription successful'
    )
  );
});

/**
 * Interpret a command using Groq LLM
 */
export const interpretCommand = asyncHandler(async (req: Request, res: Response) => {
  const { text } = req.body;

  // Validate input
  if (!text) {
    throw new ApiError(400, 'Command text is required');
  }

  // Interpret command
  const result = await interpretLabCommand(text);

  if (!result.success) {
    throw new ApiError(500, 'Failed to interpret command');
  }

  // Return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        intent: result.intent,
        confidence: result.confidence,
        actionParams: result.actionParams
      },
      'Command interpretation successful'
    )
  );
}); 