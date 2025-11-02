// test/sweets.e2e-spec.ts
import request from 'supertest';
import app from '../src/app';
import { SweetService } from '../src/modules/sweets/sweets.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { Sweet } from '../src/modules/sweets/entities/sweet.entity';

// Global storage for the token. Service instances are now local to the suite.
let accessToken: string; 

const BASE_SWEETS_URL = '/api/sweets';

const testSweet = {
    name: "Gummy Bear Bag",
    category: "Gummy",
    price: 3.50,
    quantity: 50
};

// --- Test Suite 1: Security Check (Passes) ---
describe('Sweets E2E: Protected Access', () => {
    it('GET ' + BASE_SWEETS_URL + ' -> Should return 401 Unauthorized if no token is provided', async () => {
        const response = await request(app)
            .get(BASE_SWEETS_URL);

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toEqual('Authorization required: No token provided.');
    });
});

// --- Test Suite 2: CRUD Operations ---
describe('Sweets E2E: CRUD Operations (Protected)', () => {
    
    // Declare service instances locally
    let sweetService: SweetService;
    let authService: AuthService;

    const loginCredentials = {
        email: 'login.user@sweetshop.com',
        password: 'SecureP@ss2025',
    };
    
    // Setup: Initialization and Data Injection
    beforeAll(async () => {
        // 1. 🔑 FIX: Initialize Services *inside* beforeAll to ensure TypeORM is ready
        sweetService = new SweetService(); 
        authService = new AuthService();   

        // 2. Inject the user directly into the DB 
        await authService.setupTestUser(
            loginCredentials.email,
            loginCredentials.password,
            'user' // Default role
        );
        
        // 3. Log in the guaranteed user to get a token (This should now pass)
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send(loginCredentials)
            .expect(200); 

        accessToken = loginResponse.body.access_token; 
        
        // 4. Inject sweet using the service
        const sweetToCreate = { ...testSweet };
        try {
            // Note: The 'as any' bypasses validation for a quicker setup
            await sweetService.create(sweetToCreate as any); 
        } catch (e) {
            // Ignore conflict error (409) if the sweet already exists from a previous run
            if (!(e instanceof Error && e.message.startsWith('Conflict'))) {
                throw e;
            }
        }
    });

    // 🔴 Final Failure should now be fixed, turning this test GREEN
    it('GET ' + BASE_SWEETS_URL + ' -> Should return 200 OK and list all sweets for an authorized user', async () => {
        const response = await request(app)
            .get(BASE_SWEETS_URL)
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data[0].name).toEqual(testSweet.name);
    });
    
    // 🔴 RED PHASE TEST for POST /api/sweets (Should now be GREEN as the logic is implemented)
    const newSweetData = {
        name: "Chocolate Fudge Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 100
    };

    it('POST ' + BASE_SWEETS_URL + ' -> Should return 201 Created for adding a new sweet', async () => {
        const response = await request(app)
            .post(BASE_SWEETS_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newSweetData);

        expect(response.statusCode).toBe(201); 
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toEqual(newSweetData.name);
        expect(response.body.quantity).toEqual(newSweetData.quantity);
    });
});