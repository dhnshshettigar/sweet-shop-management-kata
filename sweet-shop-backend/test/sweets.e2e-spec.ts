// test/sweets.e2e-spec.ts
import request from 'supertest';
import app from '../src/app';
import { SweetService } from '../src/modules/sweets/sweets.service'; // ⬅️ NEW IMPORT: Use the Service
import { AuthService } from '../src/modules/auth/auth.service'; // ⬅️ NEW IMPORT: Use the Service
import { Sweet } from '../src/modules/sweets/entities/sweet.entity';

// Global instances for setup
let accessToken: string;
const sweetService = new SweetService(); // ⬅️ Initialize Sweet Service
const authService = new AuthService(); // ⬅️ Initialize Auth Service

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
    
    const loginCredentials = {
        email: 'login.user@sweetshop.com',
        password: 'SecureP@ss2025',
    };
    
    // Setup: Get a valid JWT token and save a test sweet directly to the DB
    beforeAll(async () => {
        // 1. 🔑 FIX: Inject the user directly into the DB using the Service to guarantee existence
        // This is the most reliable setup pattern in Express.
        await authService.setupTestUser(
            loginCredentials.email,
            loginCredentials.password,
            'user' // Default role
        );
        
        // 2. Log in the guaranteed user to get a token (This should now pass)
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send(loginCredentials)
            .expect(200); 

        accessToken = loginResponse.body.access_token;
        
        // 3. 🍬 FIX: Use the SweetService to inject the sweet, forcing the module to initialize
        // We use the service's create method, but bypass validation needed for production.
        const sweetToCreate = { ...testSweet }; // Use a copy to prevent test data modification
        try {
            await sweetService.create(sweetToCreate as any); 
        } catch (e) {
            // Ignore conflict error (409) if the sweet already exists from a previous run
            if (!(e instanceof Error && e.message.startsWith('Conflict'))) {
                throw e;
            }
        }
    });

    // 🔴 Final Failure should be here: Data Array is 0
    it('GET ' + BASE_SWEETS_URL + ' -> Should return 200 OK and list all sweets for an authorized user', async () => {
        // 1. Act: Send request with the Authorization header
        const response = await request(app)
            .get(BASE_SWEETS_URL)
            .set('Authorization', `Bearer ${accessToken}`);

        // 2. Assert: Check for creation success and correct data returned
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length).toBeGreaterThanOrEqual(1); // ⬅️ EXPECTED GREEN NOW
        expect(response.body.data[0].name).toEqual(testSweet.name);
    });
    
    // 🔴 RED PHASE TEST for POST /api/sweets
    const newSweetData = {
        name: "Chocolate Fudge Bar",
        category: "Chocolate",
        price: 5.99,
        quantity: 100
    };

    it('POST ' + BASE_SWEETS_URL + ' -> Should return 201 Created for adding a new sweet', async () => {
        // 1. Act: Send POST request with token and new sweet data
        const response = await request(app)
            .post(BASE_SWEETS_URL)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newSweetData);

        // 2. Assert: Check for creation success and correct data returned
        // This test should pass because the Create logic was fully implemented in Step 46.
        expect(response.statusCode).toBe(201); 
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toEqual(newSweetData.name);
        expect(response.body.quantity).toEqual(newSweetData.quantity);
    });
});