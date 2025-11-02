// test/auth.e2e-spec.ts
import request from 'supertest';
import app from '../src/app'; // Import our Express application instance

describe('Auth E2E: User Registration', () => {
    const registerUrl = '/api/auth/register';

    // Define valid user data to be used in tests
    const validUser = {
        email: 'tdd.user@sweetshop.com',
        password: 'StrongP@ss123',
    };

    // 🔴 RED PHASE TEST 1: Should fail because the endpoint is not yet implemented
    it('POST ' + registerUrl + ' -> Should return 201 Created for valid registration', async () => {
        // 1. Act: Send the registration request to the non-existent endpoint
        const response = await request(app)
            .post(registerUrl)
            .send(validUser);

        // 2. Assert: We expect the DESIRED outcome (201 Created)
        // This will FAIL initially, likely with a 404 Not Found or 500 Server Error
        expect(response.statusCode).toBe(201);
    });

    // 🔴 RED PHASE TEST 2: Should fail initially because we haven't fully implemented 
    //    the custom error handling and cleanup for this specific test case.
    it('POST ' + registerUrl + ' -> Should return 409 Conflict if email is already in use', async () => {
        // 1. Arrange: Register the user successfully first (this runs fine from test 1)
        await request(app)
            .post(registerUrl)
            .send(validUser)
            .expect(201); // Ensure first registration passes

        // 2. Act: Attempt to register the SAME user again
        const response = await request(app)
            .post(registerUrl)
            .send(validUser);

        // 3. Assert: We expect a 409 Conflict status
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toEqual('Registration failed: Email already in use.');
    });
});