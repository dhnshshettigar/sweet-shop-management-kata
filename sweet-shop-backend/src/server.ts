// src/server.ts
import 'reflect-metadata'; // Must be imported first for TypeORM decorators
import app from './app';
import { initializeDatabase } from './shared/database/data-source';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        // 1. Initialize the database connection (TypeORM connects to PostgreSQL)
        await initializeDatabase(); 
        
        // 2. Start the Express server
        app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
            console.log(`Access at http://localhost:${PORT}`);
        });
    } catch (error) {
        // 3. Log the error and exit if startup fails (e.g., DB connection issue)
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the entire application
bootstrap();