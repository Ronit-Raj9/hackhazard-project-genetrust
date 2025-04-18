/**
 * Service for interacting with the CRISPR prediction API
 */

export interface CrisprPredictionRequest {
  sequence: string;
}

export interface CrisprPredictionResponse {
  originalSequence: string;
  editedSequence: string;
  changeIndicator: string;
  efficiency: number;
  changedPosition: number;
  originalBase: string;
  newBase: string;
  message: string;
  originalEfficiency: number;
}

/**
 * Fetches a CRISPR prediction from the API
 * @param sequence The DNA sequence to predict edits for
 * @returns The prediction result
 */
export async function fetchCrisprPrediction(sequence: string): Promise<CrisprPredictionResponse> {
  const response = await fetch('/api/crispr/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sequence }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch prediction');
  }

  const data = await response.json();
  return data.data; // Access the data property from the ApiResponse
} 