// src/shared/database/data-source.ts

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../../modules/auth/entities/user.entity'; 

export const AppDataSource = new DataSource({
    type: 'postgres',
    
    // Connection details matching your Docker setup
    host: 'localhost',
    port: 5432,
    username: 'sweetuser',
    password: 'sweetpassword',
    database: 'sweetshop_db',

    // Essential for development: creates tables based on entities
    synchronize: true, 
    logging: false,
    entities: [User], // List of all entity classes
    migrations: [],
    subscribers: [],
});

// Helper function to initialize and verify the connection
export const initializeDatabase = async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized and connected to PostgreSQL!');
        }
    } catch (err) {
        console.error('Error during Data Source initialization. Ensure Docker is running:', err);
        // Important: Exit the process if we cannot connect to the database
        process.exit(1); 
    }
};