// src/app.ts
import authRouter from './modules/auth/auth.router'
import sweetsRouter from './modules/sweets/sweets.router';
import express, { Request, Response, NextFunction } from 'express';
import { json } from 'body-parser';
import * as dotenv from 'dotenv';
import { AppDataSource } from './shared/database/data-source'; // Added import for setup verification

// Load environment variables (if any)
dotenv.config();

const app = express();

// 1. Global Middleware
app.use(json()); // Middleware to parse incoming JSON request bodies

// 2. Global Prefix (Auth router will be mounted here later)
app.use('/api/auth', authRouter); 
app.use('/api/sweets', sweetsRouter);


// 3. Simple health check endpoint
app.get('/', (req: Request, res: Response) => {
    // Check if the database connection is initialized for a quick health check
    const dbStatus = AppDataSource.isInitialized ? 'Connected' : 'Disconnected';
    res.status(200).json({ 
        message: 'Sweet Shop API is running!',
        dbStatus: dbStatus
    });
});

// 4. Global Error Handler (Minimal version, to be expanded later)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong on the server!');
});

export default app;