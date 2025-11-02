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

    // Note: Since registration tests passed, we leave these as-is.
    it('POST ' + registerUrl + ' -> Should return 201 Created for valid registration', async () => {
        const response = await request(app)
            .post(registerUrl)
            .send(validUser);

        expect(response.statusCode).toBe(201);
    });

    it('POST ' + registerUrl + ' -> Should return 409 Conflict if email is already in use', async () => {
        await request(app)
            .post(registerUrl)
            .send(validUser)
            .expect(201);

        const response = await request(app)
            .post(registerUrl)
            .send(validUser);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toEqual('Registration failed: Email already in use.');
    });
});
// -------------------------------------------------------------
// FIX: Moving registerUrl definition here to fix the scoping error
describe('Auth E2E: User Login', () => {
    const loginUrl = '/api/auth/login';
    const registerUrl = '/api/auth/register'; // ⬅️ DEFINED LOCALLY

    // We use a predefined user we will register in the setup
    const loginCredentials = {
        email: 'login.user@sweetshop.com',
        password: 'SecureP@ss2025',
    };

    // 💡 FIX: Register the user BEFORE running the login test suite
    beforeAll(async () => {
        // We use the locally defined registerUrl
        await request(app)
            .post(registerUrl)
            .send(loginCredentials);
        // We do NOT expect(201) here to keep the setup clean and avoid crashing the test harness on setup failure.
    });

    // 🔴 Should now be GREEN
    it('POST ' + loginUrl + ' -> Should return 200 OK and a JWT token for valid credentials', async () => {
        const response = await request(app)
            .post(loginUrl)
            .send(loginCredentials);

        // Assert: We expect 200 OK and a response body containing an access_token
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('access_token');
    });
});