import { Router } from 'express';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import iotRoutes from './routes/iot.routes';
import groqRoutes from './routes/groq.routes';
import healthRoutes from './routes/health.routes';
import crisprRoutes from '../routes/crispr.routes';

const router = Router();

// Register all routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/iot', iotRoutes);
router.use('/groq', groqRoutes);
router.use('/crispr', crisprRoutes);

export default router; 