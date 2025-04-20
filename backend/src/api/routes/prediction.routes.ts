import { Router } from 'express';
import { predictSequence } from '../../controllers/prediction.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// POST /api/prediction/predict
// This route calls the external Python ML service
// Remove JWT verification for testing purposes
router.post('/predict', predictSequence);

export default router; 