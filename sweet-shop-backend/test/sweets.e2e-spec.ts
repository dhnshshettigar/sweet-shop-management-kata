// test/sweets.e2e-spec.ts
import request from 'supertest';
import app from '../src/app';
import { AppDataSource } from '../src/shared/database/data-source';
import { Sweet } from '../src/modules/sweets/entities/sweet.entity';

// Global storage for the token and repository
let accessToken: string;
const sweetsRepository = AppDataSource.getRepository(Sweet);

// 💡 Using a global constant for the URL
const BASE_SWEETS_URL = '/api/sweets';

const testSweet = {
    name: "Gummy Bear Bag",
    category: "Gummy",
    price: 3.50,
    quantity: 50
};

// --- Test Suite 1: Security Check (Passes) ---
describe('Sweets E2E: Protected Access', () => {
    // This suite currently passes, verifying the 401 response without a token.

    it('GET ' + BASE_SWEETS_URL + ' -> Should return 401 Unauthorized if no token is provided', async () => {
        const response = await request(app)
            .get(BASE_SWEETS_URL);

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toEqual('Authorization required: No token provided.');
    });
});

// --- Test Suite 2: CRUD Operations (Failing) ---
describe('Sweets E2E: CRUD Operations (Protected)', () => {



    // Setup: Get a valid JWT token and save a test sweet directly to the DB
    beforeAll(async () => {
        const loginCredentials = {
            email: 'login.user@sweetshop.com',
            password: 'SecureP@ss2025',
        };

        // 1. 🔑 FIX: Register the user defensively, accepting 201 or 409
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(loginCredentials);
            
        // Assert that setup worked: user was either created (201) or already existed (409)
        if (registerResponse.statusCode !== 201 && registerResponse.statusCode !== 409) {
            throw new Error(`Test Setup Failed: Expected 201 or 409 for registration, got ${registerResponse.statusCode}`);
        }

        // 2. Log in the user to get a token (This should now pass with a clean database)
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send(loginCredentials)
            .expect(200); // ⬅️ THIS SHOULD NOW PASS

        accessToken = loginResponse.body.access_token;
        
        // 3. Save a test sweet directly to the DB
        await sweetsRepository.save(sweetsRepository.create(testSweet));
    });
    
    // 🔴 RED PHASE TEST 2: Fails because service/controller logic is missing
    it('GET ' + BASE_SWEETS_URL + ' -> Should return 200 OK and list all sweets for an authorized user', async () => {
        // 1. Act: Send request with the Authorization header
        const response = await request(app)
            .get(BASE_SWEETS_URL)
            .set('Authorization', `Bearer ${accessToken}`);

        // 2. Assert: We expect a successful response and the data array to contain the test sweet
        // This will fail on the next run because the controller doesn't return DB data yet.
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data[0].name).toEqual(testSweet.name);
    });
});