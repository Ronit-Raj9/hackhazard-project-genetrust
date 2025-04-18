import { Router } from 'express';
import { predictCrisprSequence } from '../controllers/crispr.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

// POST /api/crispr/predict
// This route calls the external Python ML service
// Remove JWT verification for testing purposes
router.post('/predict', predictCrisprSequence);

export default router; 