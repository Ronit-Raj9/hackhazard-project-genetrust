import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import config from '../config';

// Interface for the expected response from the Python prediction service
interface PredictionServiceResponse {
  originalSequence?: string;
  editedSequence?: string;
  changeIndicator?: string;
  efficiency?: number;
  changedPosition?: number;
  originalBase?: string;
  newBase?: string;
  message?: string;
  originalEfficiency?: number;
  error?: string; // Optional error field
}

// Helper function to validate DNA sequence
const isValidDNASequence = (sequence: string): boolean => {
  if (typeof sequence !== 'string' || sequence.length !== 20) {
    return false;
  }
  const validBases = /^[ATCG]+$/;
  return validBases.test(sequence.toUpperCase());
};

/**
 * Controller to handle CRISPR sequence prediction requests by calling the Python service
 */
export const predictCrisprSequence = asyncHandler(async (req: Request, res: Response) => {
  const { sequence } = req.body;

  // --- Validation ---
  if (!sequence) {
    throw new ApiError(400, 'DNA sequence is required');
  }

  const upperSequence = String(sequence).toUpperCase();

  if (!isValidDNASequence(upperSequence)) {
    throw new ApiError(400, 'Invalid DNA sequence. Must be 20 characters long and contain only A, T, C, G.');
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
    });

    // Assert the type of the response data
    const responseData = await response.json() as PredictionServiceResponse;

    if (!response.ok) {
      // Forward error from Python service if available
      const errorMessage = responseData?.error || `Prediction service failed with status ${response.status}`;
      console.error('CRISPR prediction service error:', errorMessage);
      // Use 502 Bad Gateway if the downstream service fails
      throw new ApiError(502, `Prediction service error: ${errorMessage}`);
    }

    console.log('CRISPR prediction service responded successfully.');

    // --- Send Response to Frontend ---
    // Ensure we are sending the correct data structure
    return res.status(200).json(
      new ApiResponse(
        200,
        responseData, // Forward the typed data from the Python service
        'CRISPR Prediction successful'
      )
    );

  } catch (error: any) {
    console.error('Error calling CRISPR prediction service:', error);

    // Handle fetch-specific errors (e.g., network issues)
    if (error.name === 'FetchError' || error.code === 'ECONNREFUSED') {
      throw new ApiError(503, 'CRISPR prediction service is unavailable. Please ensure it is running.');
    }
    
    // Re-throw ApiError if it's already formatted
    if (error instanceof ApiError) {
      throw error;
    }

    // Generic internal server error
    throw new ApiError(500, 'Failed to get CRISPR prediction from service');
  }
}); 