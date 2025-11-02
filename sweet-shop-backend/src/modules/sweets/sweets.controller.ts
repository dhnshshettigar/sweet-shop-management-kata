// src/modules/sweets/sweets.controller.ts

import { Request, Response, NextFunction } from 'express';
import { SweetService } from './sweets.service';

// Initialize the service
const sweetService = new SweetService();

// Controller class to hold methods for routing
export class SweetController {
    
    // GET /api/sweets handler
    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            // 1. Call the Service to fetch all sweets
            const sweets = await sweetService.findAll();

            // 2. Return 200 OK and the list
            return res.status(200).json({ 
                data: sweets,
                count: sweets.length
            });
            
        } catch (error) {
            // Pass errors to the global error handler
            next(error);
        }
    }
    
    // Other controller methods will go here...
}

// Export an instance of the controller
export const sweetController = new SweetController();