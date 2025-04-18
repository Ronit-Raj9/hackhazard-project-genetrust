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
 * Analyze lab image for safety issues using Groq (simulated vision processing)
 * Note: In a real implementation, you would process an actual image
 * @param scenario The scenario identifier for simulation
 * @returns Analysis result with alert message
 */
export const analyzeLabImage = async (scenario: string) => {
  try {
    // Simulate vision analysis output based on scenario
    let visionOutput = '';
    let severity: 'low' | 'medium' | 'high' = 'low';
    
    switch (scenario) {
      case 'spill_detected':
        visionOutput = 'Chemical spill detected on floor near centrifuge station';
        severity = 'high';
        break;
      case 'no_gloves':
        visionOutput = 'Personnel detected handling samples without proper gloves';
        severity = 'medium';
        break;
      case 'contamination_risk':
        visionOutput = 'Open containers near biological samples, potential cross-contamination';
        severity = 'medium';
        break;
      case 'equipment_misuse':
        visionOutput = 'Improper handling of pipette detected, potential equipment damage';
        severity = 'low';
        break;
      case 'normal_lab':
      default:
        // No issues detected
        return {
          success: true,
          message: 'No safety issues detected. Lab conditions normal.',
          severity: 'low',
        };
    }

    // Use Groq to generate an alert message based on the detected issue
    const prompt = `
      You are an AI safety assistant for a CRISPR laboratory. 
      
      The vision system has detected the following safety issue:
      "${visionOutput}"
      
      Generate a concise, clear alert message for lab personnel that includes:
      1. A brief description of the problem
      2. The potential risk this presents
      3. A specific recommendation for immediate action to resolve it
      
      Format your response as a single paragraph alert message. Be direct and professional.
    `;

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful lab safety assistant that provides clear, actionable alerts.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];

    const response = await chatCompletion(messages, 'llama3-70b-8192'); // Using the higher-end model for safety
    
    return {
      success: response.success,
      message: response.message,
      severity,
    };
  } catch (error) {
    logger.error('Error in lab image analysis:', error);
    return {
      success: false,
      message: 'Failed to analyze lab image',
      error,
    };
  }
};

/**
 * Transcribe lab audio using Groq (simulated audio processing)
 * Note: In a real implementation, you would process an actual audio file
 * @param audioCommand Identifier or text of the audio command for simulation
 * @returns Transcription result
 */
export const transcribeLabAudio = async (audioCommand: string) => {
  try {
    // For simulation purposes, we'll use predefined commands
    // In a real implementation, this would call Groq's STT API with audio data
    
    // Simulate transcription delay for realism
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Map of predefined commands for simulation
    const commandMap: Record<string, string> = {
      'scan_lab': 'Scan the lab for safety issues',
      'show_temperature': 'Show me the temperature trends',
      'show_humidity': 'Display the humidity chart',
      'show_co2': 'Switch to the CO2 levels chart',
      'show_ph': 'Show me the pH readings',
      'show_oxygen': 'Display oxygen concentration',
      'alert_manager': 'Alert the lab manager',
      'take_snapshot': 'Take a snapshot of current readings',
      'help': 'I need help with the monitoring system',
    };
    
    // If the input is one of our predefined keys, return the mapped value
    if (audioCommand in commandMap) {
      return {
        success: true,
        transcription: commandMap[audioCommand],
      };
    }
    
    // Otherwise treat the input as direct text (for demo flexibility)
    return {
      success: true,
      transcription: audioCommand,
    };
  } catch (error) {
    logger.error('Error in audio transcription:', error);
    return {
      success: false,
      transcription: '',
      error,
    };
  }
};

/**
 * Interpret a lab command using Groq LLM
 * @param text The command text to interpret
 * @returns Interpreted command intent and parameters
 */
export const interpretLabCommand = async (text: string) => {
  try {
    const prompt = `
      You are an AI command interpreter for a laboratory monitoring system.
      
      The user has issued the following voice command:
      "${text}"
      
      Identify the user's intent from the following options:
      - scan_safety: Check the lab for safety issues
      - show_chart: Display a specific sensor's data chart
      - alert: Notify someone or trigger an alert
      - snapshot: Save current sensor data
      - help: Get assistance with the system
      - unknown: The command doesn't match any known intent
      
      If the intent is "show_chart", also identify which sensor they want to see:
      temperature, humidity, pH, co2, oxygen, or pressure.
      
      Format your response as JSON with the following structure:
      {
        "intent": "intent_name",
        "confidence": 0.9,
        "actionParams": {
          "sensor": "sensor_name"  // Only for show_chart intent
        }
      }
      
      Respond with ONLY the JSON object, nothing else.
    `;
    
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful command interpreter that returns only valid JSON.',
      },
      {
        role: 'user' as const,
        content: prompt,
      },
    ];
    
    const response = await chatCompletion(messages);
    
    if (!response.success) {
      return {
        success: false,
        intent: 'unknown',
        confidence: 0,
        actionParams: {},
      };
    }
    
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(response.message);
      
      return {
        success: true,
        intent: parsedResponse.intent || 'unknown',
        confidence: parsedResponse.confidence || 0.5,
        actionParams: parsedResponse.actionParams || {},
      };
    } catch (parseError) {
      logger.error('Error parsing command interpretation JSON:', parseError);
      
      // Fallback to basic intent extraction
      const lowerText = text.toLowerCase();
      let intent = 'unknown';
      let sensor = '';
      
      if (lowerText.includes('scan') || lowerText.includes('safety')) {
        intent = 'scan_safety';
      } else if (lowerText.includes('temperature')) {
        intent = 'show_chart';
        sensor = 'temperature';
      } else if (lowerText.includes('humidity')) {
        intent = 'show_chart';
        sensor = 'humidity';
      } else if (lowerText.includes('ph')) {
        intent = 'show_chart';
        sensor = 'pH';
      } else if (lowerText.includes('co2')) {
        intent = 'show_chart';
        sensor = 'co2';
      } else if (lowerText.includes('oxygen')) {
        intent = 'show_chart';
        sensor = 'oxygen';
      } else if (lowerText.includes('alert') || lowerText.includes('notify')) {
        intent = 'alert';
      } else if (lowerText.includes('snapshot') || lowerText.includes('save')) {
        intent = 'snapshot';
      } else if (lowerText.includes('help')) {
        intent = 'help';
      }
      
      return {
        success: true,
        intent,
        confidence: 0.7,
        actionParams: sensor ? { sensor } : {},
      };
    }
  } catch (error) {
    logger.error('Error in command interpretation:', error);
    return {
      success: false,
      intent: 'unknown',
      confidence: 0,
      actionParams: {},
      error,
    };
  }
}; 