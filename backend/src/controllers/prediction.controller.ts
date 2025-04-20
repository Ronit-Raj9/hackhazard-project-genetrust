import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import config from '../config';

// Interface for the expected response from the Python prediction service
interface PredictionServiceResponse {
  originalSequence: string;
  editedSequence: string;
  changeIndicator: string;
  efficiency: number;
  changedPosition: number;
  originalBase: string;
  newBase: string;
  message: string;
  originalEfficiency: number;
  error?: string; // Optional error field
}

// Helper function to validate DNA sequence
const isValidDNASequence = (sequence: string): boolean => {
  // Must contain only A, T, C, G
  const validBases = /^[ATCG]+$/;
  return validBases.test(sequence.toUpperCase());
};

/**
 * Controller to handle DNA sequence prediction requests by calling the Python service
 */
export const predictSequence = asyncHandler(async (req: Request, res: Response) => {
  const { sequence } = req.body;

  console.log(`Received prediction request for sequence: ${sequence}`);

  // --- Validation ---
  if (!sequence) {
    throw new ApiError(400, 'DNA sequence is required');
  }

  const upperSequence = String(sequence).toUpperCase();

  if (!isValidDNASequence(upperSequence)) {
    throw new ApiError(400, 'Invalid DNA sequence. Must contain only A, T, C, G.');
  }

  // For the Python model, we need a sequence of exactly 20 characters
  if (upperSequence.length !== 20) {
    throw new ApiError(400, 'DNA sequence must be exactly 20 characters long for prediction.');
  }

  // --- Call Python Prediction Service ---
  const predictionServiceUrl = `${config.PREDICTION_SERVICE_URL}/predict`;

  try {
    console.log(`Calling prediction service at ${predictionServiceUrl} with sequence: ${upperSequence}`);

    const response = await fetch(predictionServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence: upperSequence }),
      // Adding timeout to avoid long waits if service is down
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    console.log(`Received response with status: ${response.status}`);
    
    // Assert the type of the response data
    const responseData = await response.json() as PredictionServiceResponse;

    if (!response.ok) {
      // Forward error from Python service if available
      const errorMessage = responseData?.error || `Prediction service failed with status ${response.status}`;
      console.error('Prediction service error:', errorMessage);
      // Use 502 Bad Gateway if the downstream service fails
      throw new ApiError(502, `Prediction service error: ${errorMessage}`);
    }

    console.log('Prediction service responded successfully.');
    console.log('Prediction results:', JSON.stringify(responseData, null, 2));

    // --- Send Response to Frontend ---
    // Ensure we are sending the correct data structure
    return res.status(200).json(
      new ApiResponse(
        200,
        responseData, // Forward the typed data from the Python service
        'DNA Sequence Prediction successful'
      )
    );

  } catch (error: any) {
    console.error('Error calling prediction service:', error);

    // Handle fetch-specific errors (e.g., network issues)
    if (error.name === 'AbortError') {
      throw new ApiError(504, 'Prediction service request timed out. The service may be overloaded or unavailable.');
    }
    
    if (error.name === 'FetchError' || error.code === 'ECONNREFUSED') {
      throw new ApiError(503, 'Prediction service is unavailable. Please ensure it is running at: ' + config.PREDICTION_SERVICE_URL);
    }
    
    // Re-throw ApiError if it's already formatted
    if (error instanceof ApiError) {
      throw error;
    }

    // Generic internal server error
    throw new ApiError(500, `Failed to get prediction from service: ${error.message}`);
  }
}); 