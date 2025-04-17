import { Router } from 'express';
import { predictCrisprSequence } from '../controllers/crispr.controller';
import { verifyJWT } from '../middleware/auth';

const router = Router();

// POST /api/crispr/predict
// This route calls the external Python ML service
router.post('/predict', verifyJWT, predictCrisprSequence);

export default router; 