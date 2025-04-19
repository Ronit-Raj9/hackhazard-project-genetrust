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

/**
 * Analyze lab image for safety compliance
 * @param scenario Type of scenario to analyze
 * @returns Analysis result with safety insights
 */
export const analyzeLabImage = async (scenario: string) => {
  try {
    // Simulate different lab scenarios for demonstration
    const scenarioPrompts: { [key: string]: string } = {
      normal_lab: "The laboratory appears to be in normal operating condition with all safety protocols being followed.",
      spill_detected: "There is a chemical spill detected on the workbench that requires immediate cleanup.",
      no_gloves: "A researcher is handling biological samples without wearing protective gloves.",
      contamination_risk: "The biological waste container is overflowing, creating a contamination risk.",
      equipment_misuse: "Laboratory equipment is being used improperly, creating a safety hazard."
    };

    const prompt = `
      You are a laboratory safety expert. Analyze the following lab scene and provide safety insights:
      
      Scene description: ${scenarioPrompts[scenario] || "Unknown laboratory scenario"}
      
      Provide:
      1. A safety assessment of the scene
      2. Immediate actions that should be taken
      3. Preventative measures for the future
      
      Make your response concise and actionable.
    `;

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful laboratory safety assistant that provides clear, actionable insights.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const completion = await chatCompletion(messages);

    // Determine severity based on scenario
    let severity = 'low';
    if (scenario === 'spill_detected' || scenario === 'contamination_risk') {
      severity = 'medium';
    } else if (scenario === 'no_gloves' || scenario === 'equipment_misuse') {
      severity = 'high';
    }

    return {
      ...completion,
      severity
    };
  } catch (error) {
    logger.error('Error in analyzing lab image:', error);
    return {
      success: false,
      message: 'Failed to analyze lab image',
      severity: 'unknown',
      error,
    };
  }
};

/**
 * Transcribe lab audio commands
 * @param audioCommand The command identifier or text
 * @returns Transcription and interpretation
 */
export const transcribeLabAudio = async (audioCommand: string) => {
  try {
    // Simulate different audio commands for demonstration
    const commandTranscriptions: { [key: string]: string } = {
      protocol_request: "Can you display the protocol for CRISPR-Cas9 gene editing?",
      emergency_alert: "Emergency! We need help in Lab B. There's a chemical spill.",
      equipment_status: "What's the status of the PCR machine in Lab C?",
      data_request: "Can you show me the results from yesterday's experiment?",
      notes_command: "Add to notes: The sample showed unexpected fluorescence at 520nm"
    };

    const transcription = commandTranscriptions[audioCommand] || audioCommand;

    return {
      success: true,
      message: transcription,
      confidence: 0.95, // Simulated confidence score
    };
  } catch (error) {
    logger.error('Error in transcribing lab audio:', error);
    return {
      success: false,
      message: 'Failed to transcribe audio',
      confidence: 0,
      error,
    };
  }
};

/**
 * Interpret lab commands and provide responses
 * @param command The command to interpret
 * @returns Response to the command
 */
export const interpretLabCommand = async (command: string) => {
  try {
    const prompt = `
      You are a laboratory assistant AI. Interpret and respond to the following lab command:
      
      Command: "${command}"
      
      Provide:
      1. A clear interpretation of what the user is asking
      2. An appropriate response or action that would be taken
      3. Any clarifying questions if the command is ambiguous
      
      Make your response helpful and concise.
    `;

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful laboratory assistant that understands and responds to lab commands effectively.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    return await chatCompletion(messages);
  } catch (error) {
    logger.error('Error in interpreting lab command:', error);
    return {
      success: false,
      message: 'Failed to interpret lab command',
      error,
    };
  }
}; 