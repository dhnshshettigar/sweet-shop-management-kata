// src/modules/sweets/sweets.controller.ts

import { Request, Response, NextFunction } from 'express';
import { SweetService } from './sweets.service';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateSweetDto } from './dto/create-sweet.dto';
import { AuthenticatedRequest } from '../../shared/middleware/auth.middleware';

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

    async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        // We can check req.user.role here for Admin-only access later

        // 1. 🛡️ Validate Request Body using DTO
        const createDto = plainToInstance(CreateSweetDto, req.body);
        const errors = await validate(createDto);

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: errors.map(err => Object.values(err.constraints || {})).flat()
            });
        }

        try {
            // 2. Call the Service to create the sweet
            const newSweet = await sweetService.create(createDto);

            // 3. Return 201 Created
            return res.status(201).json(newSweet);

        } catch (error: any) {
            if (error.message.startsWith('Conflict')) {
                return res.status(409).json({ message: 'Sweet already exists.' });
            }
            next(error);
        }
    }
    // Other controller methods will go here...
}

// Export an instance of the controller
export const sweetController = new SweetController();