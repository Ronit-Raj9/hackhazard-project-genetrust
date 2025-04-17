import { Router } from 'express';
import { 
  createPrediction, 
  getUserPredictions, 
  getPredictionById, 
  addExplanation 
} from '../../controllers/prediction.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.post('/', createPrediction);
router.get('/', getUserPredictions);
router.get('/:id', getPredictionById);
router.post('/:id/explanation', addExplanation);

export default router; 