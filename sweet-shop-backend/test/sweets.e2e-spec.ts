// test/sweets.e2e-spec.ts
import request from 'supertest';
import app from '../src/app';
import { AppDataSource } from '../src/shared/database/data-source';
import { Sweet } from '../src/modules/sweets/entities/sweet.entity';


// Global storage for the token and repository
let accessToken: string;
const sweetsRepository = AppDataSource.getRepository(Sweet);
const sweetsUrl = '/api/sweets';
const testSweet = {
    name: "Gummy Bear Bag",
    category: "Gummy",
    price: 3.50,
    quantity: 50
};

describe('Sweets E2E: Protected Access', () => {
    const sweetsUrl = '/api/sweets';

    // 🔴 RED PHASE TEST 1: Should fail because the endpoint is not yet implemented
    it('GET ' + sweetsUrl + ' -> Should return 401 Unauthorized if no token is provided', async () => {
        // 1. Act: Send request without Authorization header
        const response = await request(app)
            .get(sweetsUrl);

        // 2. Assert: We expect the DESIRED security outcome
        // This will fail initially (404) until the route is defined and protected.
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toEqual('Authorization required: No token provided.');
    });
});

describe('Sweets E2E: CRUD Operations (Protected)', () => {
    
    // Setup: Get a valid JWT token and save a test sweet directly to the DB
    beforeAll(async () => {
        // 1. Log in a user to get a token (assuming a user is available from auth tests)
        const loginCredentials = {
            email: 'login.user@sweetshop.com',
            password: 'SecureP@ss2025',
        };

        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send(loginCredentials)
            .expect(200);

        accessToken = loginResponse.body.access_token;

        // 2. Save a test sweet directly to the DB (Bypassing the API for setup)
        await sweetsRepository.save(sweetsRepository.create(testSweet));
    });

    // 🔴 RED PHASE TEST 2: Fails because service/controller logic is missing
    it('GET ' + sweetsUrl + ' -> Should return 200 OK and list all sweets for an authorized user', async () => {
        // 1. Act: Send request with the Authorization header
        const response = await request(app)
            .get(sweetsUrl)
            .set('Authorization', `Bearer ${accessToken}`);

        // 2. Assert: We expect a successful response and the data array to contain the test sweet
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data.length).toBeGreaterThanOrEqual(1);
        expect(response.body.data[0].name).toEqual(testSweet.name);
    });
});