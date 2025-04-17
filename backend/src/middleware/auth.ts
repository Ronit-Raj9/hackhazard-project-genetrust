import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler';
import ApiError from '../utils/ApiError';
import config from '../config';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        walletAddress?: string;
        role?: string;
      };
    }
  }
}

/**
 * Middleware to verify JWT token from cookies
 */
export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from cookie or Authorization header
    const cookieToken = req.cookies?.accessToken;
    const headerToken = req.header('Authorization')?.replace('Bearer ', '');
    const token = cookieToken || headerToken;
    
    console.log('Auth middleware - Cookie token exists:', !!cookieToken);
    console.log('Auth middleware - Header token exists:', !!headerToken);
    
    if (!token) {
      console.log('No authentication token found in request (cookies or Authorization header)');
      throw new ApiError(401, 'Unauthorized request');
    }

    try {
      // Verify token
      // Define the expected payload structure
      interface JwtPayload {
        id: string;
        email?: string;
        walletAddress?: string;
        role?: string;
      }
      
      const decodedToken = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
      console.log('JWT verification successful, ID:', decodedToken.id);

      // Check if essential 'id' field exists
      if (!decodedToken.id) {
          throw new ApiError(401, 'Invalid token payload: Missing user ID');
      }

      // Set user in request, handling potentially missing fields
      req.user = {
        id: decodedToken.id,
        email: decodedToken.email,
        walletAddress: decodedToken.walletAddress,
        role: decodedToken.role
      };

      next();
    } catch (error) {
      // Handle specific JWT errors if needed, otherwise generalize
      if (error instanceof jwt.JsonWebTokenError) {
        console.error('JWT verification failed:', error.message);
        throw new ApiError(401, `Invalid token: ${error.message}`);
      } else if (error instanceof ApiError) {
        throw error; // Re-throw our custom API errors
      }
      // Log unexpected errors for debugging
      console.error("JWT Verification Error:", error); 
      throw new ApiError(401, 'Invalid token');
    }
  }
); 