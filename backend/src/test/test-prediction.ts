/**
 * Test script for the DNA prediction API
 * 
 * This script sends a test DNA sequence to the backend API
 * which then communicates with the Python prediction service.
 */

// Set your backend API URL here
const BACKEND_API_URL = 'http://localhost:8000/api/prediction/predict';

/**
 * Test DNA sequences
 */
const TEST_SEQUENCES = [
  "ACGTAGCATCGGATCTATCT", // Valid 20-character sequence
  "TTTTAAAACCCGGGGGNNNN", // Invalid sequence with N's
  "ACGT",                 // Too short sequence
];

/**
 * Test the prediction API with a DNA sequence
 */
async function testPrediction(sequence: string) {
  console.log(`\nTesting with sequence: ${sequence}`);
  console.log('-'.repeat(50));
  
  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence }),
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error };
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(`Testing DNA Prediction API at: ${BACKEND_API_URL}`);
  console.log('='.repeat(50));
  
  // Test valid sequence
  await testPrediction(TEST_SEQUENCES[0]);
  
  // Test invalid sequence with non-ATCG characters
  await testPrediction(TEST_SEQUENCES[1]);
  
  // Test too short sequence
  await testPrediction(TEST_SEQUENCES[2]);
}

// Run the tests
runTests().catch(console.error);

/**
 * Usage instructions:
 * 1. Make sure the backend server is running
 * 2. Make sure the Python prediction service is running
 * 3. Run this script with: npx ts-node test-prediction.ts
 */ 