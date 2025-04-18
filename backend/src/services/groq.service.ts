import { Groq } from 'groq-sdk';
import config from '../config';
import logger from '../utils/logger';

// Initialize Groq client
const groqClient = new Groq({
  apiKey: config.GROQ_API_KEY,
});

/**
 * Chat completion with Groq
 * @param messages Array of chat messages
 * @param model Groq model to use
 * @returns Chat completion response
 */
export const chatCompletion = async (
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model = 'llama3-8b-8192' // Default model
) => {
  try {
    const response = await groqClient.chat.completions.create({
      messages,
      model,
    });

    return {
      success: true,
      message: response.choices[0]?.message?.content || '',
      usage: response.usage,
    };
  } catch (error) {
    logger.error('Error in Groq chat completion:', error);
    return {
      success: false,
      message: 'Failed to get response from Groq',
      error,
    };
  }
};

/**
 * Get Groq explanation for CRISPR prediction
 * @param originalSequence Original DNA sequence
 * @param predictedSequence Predicted DNA sequence
 * @param editCount Number of edits
 * @param editPositions Array of edit positions
 * @returns Explanation from Groq
 */
export const getCrisprExplanation = async (
  originalSequence: string,
  predictedSequence: string,
  editCount: number,
  editPositions: number[]
) => {
  const prompt = `
    You are a CRISPR gene editing expert. Explain the following gene edit prediction in detail:
    
    Original Sequence: ${originalSequence}
    Predicted Sequence: ${predictedSequence}
    Number of Edits: ${editCount}
    Edit Positions: ${editPositions.join(', ')}
    
    Provide a detailed explanation of:
    1. The type of edit (insertion, deletion, substitution)
    2. Potential impact on gene function
    3. Possible biological implications
    
    Keep your explanation clear and informative, suitable for both students and researchers.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'You are a helpful CRISPR gene editing assistant that provides clear, accurate explanations.',
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  return await chatCompletion(messages);
};

/**
 * Get Groq insights for IoT sensor data
 * @param temperature Current temperature
 * @param humidity Current humidity
 * @param pressure Current pressure (optional)
 * @param light Current light level (optional)
 * @param co2 Current CO2 level (optional)
 * @returns Insights from Groq
 */
export const getSensorInsights = async (
  temperature: number,
  humidity: number,
  pressure?: number,
  light?: number,
  co2?: number
) => {
  const prompt = `
    You are a laboratory environment expert. Analyze the following sensor readings and provide insights:
    
    Temperature: ${temperature}°C
    Humidity: ${humidity}%
    ${pressure ? `Pressure: ${pressure} hPa` : ''}
    ${light ? `Light Level: ${light} lux` : ''}
    ${co2 ? `CO2 Level: ${co2} ppm` : ''}
    
    Provide insights on:
    1. Whether these conditions are optimal for biological experiments
    2. Any concerning values that might affect experiment results
    3. Recommendations for maintaining ideal conditions
    
    Make your response concise and actionable.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'You are a helpful laboratory environment assistant that provides clear, actionable insights.',
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  return await chatCompletion(messages);
};

/**
 * Get blockchain guidance from Groq
 * @param walletAddress User's wallet address
 * @param dataType Type of data being verified (prediction or monitoring)
 * @returns Guidance from Groq
 */
export const getBlockchainGuidance = async (
  walletAddress: string,
  dataType: 'prediction' | 'monitoring'
) => {
  const prompt = `
    You are a blockchain interaction guide. Provide guidance for a user with wallet address ${walletAddress} 
    who wants to verify ${dataType} data on the blockchain:
    
    Explain:
    1. Why blockchain verification is valuable for ${dataType} data
    2. What will happen when they click the verification button
    3. How this contributes to scientific reproducibility
    
    Keep your response friendly, concise, and informative.
  `;

  const messages = [
    {
      role: 'system' as const,
      content: 'You are a helpful blockchain guide that provides clear, user-friendly guidance.',
    },
    {
      role: 'user' as const,
      content: prompt,
    },
  ];

  return await chatCompletion(messages);
}; 