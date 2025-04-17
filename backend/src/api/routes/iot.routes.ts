import { Router } from 'express';
import { 
  getLatestData, 
  getSensorDataInsights 
} from '../../controllers/iot.controller';
import { verifyJWT } from '../../middleware/auth';

const router = Router();

// All routes are protected
router.use(verifyJWT);

router.get('/data', getLatestData);
router.get('/insights', getSensorDataInsights);

export default router; 