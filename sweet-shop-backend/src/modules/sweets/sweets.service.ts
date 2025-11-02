// src/modules/sweets/sweets.service.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../../shared/database/data-source';
import { Sweet } from './entities/sweet.entity';

// The Sweet Repository from TypeORM
const sweetRepository: Repository<Sweet> = AppDataSource.getRepository(Sweet);

// Core business logic for sweets
export class SweetService {
    
    /**
     * Retrieves all sweets currently in the database.
     */
    async findAll(): Promise<Sweet[]> {
        // Return all sweets
        return sweetRepository.find();
    }
    
    // Other service methods will go here...
}