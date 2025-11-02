// src/shared/middleware/admin.middleware.ts

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware'; // Import the type that includes req.user

/**
 * Middleware to check if the authenticated user has the 'admin' role.
 */
export const adminAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // 1. Ensure a user object exists (this should be guaranteed by jwtAuthMiddleware)
  if (!req.user) {
    // If no user is attached, something went wrong in JWT processing
    return res.status(401).json({ message: 'Authorization required: User data missing.' });
  }

  // 2. Check the user's role
  if (req.user.role !== 'admin') {
    // Return 403 Forbidden for unauthorized access
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  // 3. User is an admin; proceed
  next();
};