// src/shared/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// ⚠️ WARNING: We must read the secret key from the environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev'; 
// Note: This must match the key read in auth.service.ts

// Define a new type for the Request object to include the user payload
export interface AuthenticatedRequest extends Request {
  user?: { 
    id: number; 
    email: string; 
    role: string;
  };
}

/**
 * Middleware to validate the JWT token in the Authorization header.
 * If valid, it attaches the user payload to req.user.
 * If invalid or missing, it returns 401 Unauthorized.
 */
export const jwtAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. Check for token presence
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required: No token provided.' });
  }

  // 2. Extract the token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify and decode the token
    const decodedPayload = jwt.verify(token, JWT_SECRET) as { 
      id: number; 
      email: string; 
      role: string; 
      iat: number; 
      exp: number;
    };

    // 4. Attach user information to the request object
    req.user = {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
    };

    // 5. Token is valid; proceed to the next handler/controller
    next();

  } catch (error) {
    // 6. Handle token verification failure (e.g., expired, invalid signature)
    return res.status(401).json({ message: 'Authorization failed: Invalid or expired token.' });
  }
};