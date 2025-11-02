// src/modules/sweets/sweets.service.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../../shared/database/data-source';
import { Sweet } from './entities/sweet.entity';
import { CreateSweetDto } from './dto/create-sweet.dto';

// The Sweet Repository from TypeORM
// const sweetRepository: Repository<Sweet> = AppDataSource.getRepository(Sweet);

// Core business logic for sweets
export class SweetService {

    // 💡 NEW: Getter method to fetch the repository safely
    private getRepository(): Repository<Sweet> {
        // This ensures the repository is fetched after AppDataSource is initialized
        return AppDataSource.getRepository(Sweet);
    }

    /**
     * Retrieves all sweets currently in the database.
     */
    async findAll(): Promise<Sweet[]> {
        // Return all sweets
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

    // Other service methods will go here...
}