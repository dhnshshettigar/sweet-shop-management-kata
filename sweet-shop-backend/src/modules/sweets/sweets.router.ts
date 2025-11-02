// src/modules/sweets/sweets.router.ts
import { Router } from 'express';
import { jwtAuthMiddleware } from '../../shared/middleware/auth.middleware'; // ⬅️ IMPORT SECURITY
import { sweetController } from './sweets.controller';
import { adminAuthMiddleware } from '../../shared/middleware/admin.middleware'; // ⬅️ NEW IMPORT

const router = Router();

// 🛡️ Apply the JWT Middleware to all routes defined below
router.use(jwtAuthMiddleware);

// Endpoint 1: GET /api/sweets - View a list of all available sweets (Protected)
// This must be defined to turn the 404 into a 401/200


router.get('/', sweetController.findAll.bind(sweetController));

// Endpoint 2: POST /api/sweets (Add New Sweet)
router.post('/', sweetController.create.bind(sweetController));
// Other protected routes will go here: POST, PUT, DELETE, SEARCH

// Endpoint 2: POST /api/sweets (Add New Sweet) - ADMIN ONLY
// We chain the security middleware: JWT check runs first, then Admin role check.
router.post('/', 
    adminAuthMiddleware, // ⬅️ NEW: Check if the authenticated user is 'admin'
    sweetController.create.bind(sweetController)
);
export default router;