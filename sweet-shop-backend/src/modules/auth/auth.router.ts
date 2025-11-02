// src/modules/auth/auth.router.ts
import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Route definition: POST /register maps to the register controller method
// We use the .bind() method to ensure 'this' context is correct inside the controller method.
router.post('/register', authController.register.bind(authController));

export default router;