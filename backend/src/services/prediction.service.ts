import logger from '../utils/logger';

/**
 * Simple utility to calculate edit distance between sequences
 * @param seq1 First sequence
 * @param seq2 Second sequence
 * @returns Edit distance and positions of edits
 */
export const calculateEditDistance = (seq1: string, seq2: string) => {
  // Make sure sequences are of the same length
  if (seq1.length !== seq2.length) {
    throw new Error('Sequences must be of the same length');
  }

  let editCount = 0;
  const editPositions: number[] = [];

  // Compare each character
  for (let i = 0; i < seq1.length; i++) {
    if (seq1[i] !== seq2[i]) {
      editCount++;
      editPositions.push(i);
    }
  }

  return { editCount, editPositions };
};

/**
 * Mock CRISPR prediction (in a real app, this would be a machine learning model)
 * @param sequence DNA sequence to predict edits for
 * @returns Predicted sequence and edit information
 */
export const predictSequenceEdits = async (sequence: string) => {
  try {
    // Validate sequence (should only contain A, T, C, G)
    const isValidSequence = /^[ATCG]+$/i.test(sequence);
    if (!isValidSequence) {
      throw new Error('Invalid DNA sequence. Sequence must only contain A, T, C, G bases.');
    }

    // Normalize sequence to uppercase
    const normalizedSequence = sequence.toUpperCase();
    
    // In a real application, this would call a ML model
    // For now, we'll implement a simple mock prediction
    // that randomly changes a few bases
    
    const bases = ['A', 'T', 'C', 'G'];
    let predictedSequence = '';
    const edits = Math.min(3, Math.max(1, Math.floor(normalizedSequence.length * 0.05))); // Edit 5% of bases, min 1, max 3
    
    // Randomly select positions to edit
    const positions = new Set<number>();
    while (positions.size < edits) {
      positions.add(Math.floor(Math.random() * normalizedSequence.length));
    }
    
    // Create predicted sequence with edits
    for (let i = 0; i < normalizedSequence.length; i++) {
      if (positions.has(i)) {
        // Replace with a different base
        const currentBase = normalizedSequence[i];
        const availableBases = bases.filter(b => b !== currentBase);
        const newBase = availableBases[Math.floor(Math.random() * availableBases.length)];
        predictedSequence += newBase;
      } else {
        predictedSequence += normalizedSequence[i];
      }
    }
    
    // Calculate edit information
    const { editCount, editPositions } = calculateEditDistance(normalizedSequence, predictedSequence);
    
    return {
      success: true,
      originalSequence: normalizedSequence,
      predictedSequence,
      editCount,
      editPositions,
    };
  } catch (error) {
    logger.error('Error in sequence prediction:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to predict sequence edits',
    };
  }
}; 