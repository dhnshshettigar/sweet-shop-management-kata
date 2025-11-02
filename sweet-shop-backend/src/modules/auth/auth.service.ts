// src/modules/auth/auth.service.ts
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken'; 
import { AppDataSource } from '../../shared/database/data-source';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';

// ⚠️ WARNING: This should be read from a secure environment variable (e.g., process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// The User Repository from TypeORM
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// Core business logic for authentication
export class AuthService {
  
  /**
   * Generates a JWT for a successfully authenticated user.
   * @param user The authenticated user object.
   * @returns A JWT string.
   */
  private generateToken(user: User): string {
    const payload = { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Registers a new user.
   * @param registerDto The DTO containing email and plain password.
   * @returns The newly created user object (without the password field).
   */
  async register(registerDto: RegisterUserDto): Promise<Omit<User, 'password'>> {
    const { email, password } = registerDto;

    // 1. Check if user already exists (Requirement: Unique email)
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      // Throw error which is caught in the controller and translated to 409 Conflict
      throw new Error('Conflict: User with this email already exists.'); 
    }

    // 2. 🔑 Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and Save the User
    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      role: 'user',
    });

    const savedUser = await userRepository.save(newUser);
    
    // 4. Return the user, excluding the password field for security
    const { password: _, ...userWithoutPassword } = savedUser;
    
    return userWithoutPassword;
  }

  /**
   * Authenticates a user and issues a JWT token.
   * @param email User email.
   * @param plainPassword Plain text password from request.
   * @returns An object containing the access token, or throws an error on failure.
   */
  async login(email: string, plainPassword: string): Promise<{ access_token: string }> {
    // 1. Find the user by email, ensuring we select the password hash
    // We use .addSelect() because the password column is marked with { select: false } in the entity
    const user = await userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    // 2. 🛡️ Check if user exists or password does not match
    if (!user) {
      throw new Error('Unauthorized: Invalid credentials.');
    }

    // 3. 🛡️ Compare the plain text password with the stored hash
    const isMatch = await bcrypt.compare(plainPassword, user.password);

    if (!isMatch) {
      throw new Error('Unauthorized: Invalid credentials.');
    }

    // 4. Generate and return the JWT
    const token = this.generateToken(user);

    return { access_token: token };
  }
}