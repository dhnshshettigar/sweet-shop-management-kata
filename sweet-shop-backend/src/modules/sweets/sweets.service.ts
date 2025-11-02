// src/modules/sweets/sweets.service.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../../shared/database/data-source';
import { Sweet } from './entities/sweet.entity';
import { CreateSweetDto } from './dto/create-sweet.dto';

// ⚠️ Global sweetRepository constant is REMOVED to prevent timing conflicts

// Core business logic for sweets
export class SweetService {
    
    // 💡 Getter method to fetch the repository safely and lazily
    private getRepository(): Repository<Sweet> {
        return AppDataSource.getRepository(Sweet);
    }
    
    /**
     * Retrieves all sweets currently in the database.
     */
    async findAll(): Promise<Sweet[]> {
        return this.getRepository().find();
    }
    
    /**
     * Creates a new sweet in the database.
     */
    async create(createSweetDto: CreateSweetDto): Promise<Sweet> {
        const sweetRepository = this.getRepository();

        // Check for existing sweet name (unique constraint)
        const existingSweet = await sweetRepository.findOne({ where: { name: createSweetDto.name } });
        if (existingSweet) {
            throw new Error('Conflict: Sweet with this name already exists.');
        }

        const newSweet = sweetRepository.create(createSweetDto);
        return sweetRepository.save(newSweet);
    }
}