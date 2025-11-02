// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// Initialize the service
const authService = new AuthService();

// Controller class to hold methods for routing
export class AuthController {
  
  // POST /api/auth/register handler
  async register(req: Request, res: Response, next: NextFunction) {
    // 1. 🛡️ Validate Request Body using DTO
    const registerDto = plainToInstance(RegisterUserDto, req.body);
    const errors = await validate(registerDto);

    if (errors.length > 0) {
      // Return 400 Bad Request if validation fails
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.map(err => Object.values(err.constraints || {})).flat()
      });
    }

    try {
      // 2. Call the Service for business logic (hashing, saving)
      const user = await authService.register(registerDto);

      // 3. Return 201 Created and the new user data
      return res.status(201).json({
        message: 'User registered successfully',
        user: user
      });
      
    } catch (error: any) {
      // 4. Handle known errors (like email conflict)
      if (error.message.startsWith('Conflict')) {
        return res.status(409).json({ message: 'Registration failed: Email already in use.' });
      }
      
      // Pass other errors (like database errors) to the global error handler
      next(error);
    }
  }
  
  // POST /api/auth/login handler ⬅️ NEW METHOD
  async login(req: Request, res: Response, next: NextFunction) {
    // 1. 🛡️ Validate Request Body using DTO
    const loginDto = plainToInstance(LoginUserDto, req.body);
    const errors = await validate(loginDto);

    if (errors.length > 0) {
      // Return 400 Bad Request if validation fails
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.map(err => Object.values(err.constraints || {})).flat()
      });
    }

    try {
      // 2. Call the Service to authenticate and get the token
      const { access_token } = await authService.login(loginDto.email, loginDto.password);

      // 3. Return 200 OK and the JWT token
      return res.status(200).json({ access_token });
      
    } catch (error: any) {
      // 4. Handle known errors (like invalid credentials)
      if (error.message.startsWith('Unauthorized')) {
        // Use 401 Unauthorized for security reasons
        return res.status(401).json({ message: 'Login failed: Invalid email or password.' });
      }
      
      // Pass other errors (like database errors) to the global error handler
      next(error);
    }
  }
}

// Export an instance of the controller
export const authController = new AuthController();