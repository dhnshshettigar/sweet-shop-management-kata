// test/sweets.e2e-spec.ts
import request from 'supertest';
import app from '../src/app';

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