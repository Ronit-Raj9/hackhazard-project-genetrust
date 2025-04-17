import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Environment configuration
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8000'),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/geneforge',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '30d',
  
  // Cookie configuration
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'cookie-secret-change-in-production',
  
  // Groq API configuration
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  
  // Frontend URL for CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Base blockchain configuration (for read-only checks)
  RPC_URL: process.env.RPC_URL || 'https://sepolia.base.org',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
  
  // Google OAuth config
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
  
  // Prediction Service URL
  PREDICTION_SERVICE_URL: process.env.PREDICTION_SERVICE_URL || 'http://localhost:8000',
};

// Validate required environment variables
const requiredEnvVars = ['GROQ_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !config[envVar as keyof typeof config]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default config; 