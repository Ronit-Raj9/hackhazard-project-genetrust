import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

/**
 * API route to handle CRISPR prediction requests
 * Forwards requests to the backend API and returns the response
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    
    // Validate the request
    if (!body.sequence) {
      return NextResponse.json(
        { success: false, message: 'DNA sequence is required' },
        { status: 400 }
      );
    }
    
    // Make sure the sequence is valid
    const sequence = body.sequence.toUpperCase();
    if (!/^[ATGC]+$/.test(sequence)) {
      return NextResponse.json(
        { success: false, message: 'Invalid DNA sequence. Must contain only A, T, C, G.' },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/crispr/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sequence }),
    });
    
    // Parse the response
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error in CRISPR prediction API route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      { status: 500 }
    );
  }
} 