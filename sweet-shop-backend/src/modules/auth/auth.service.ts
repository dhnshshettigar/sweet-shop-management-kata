// src/modules/auth/auth.service.ts
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../../shared/database/data-source';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { Repository } from 'typeorm';

// The User Repository from TypeORM
const userRepository: Repository<User> = AppDataSource.getRepository(User);

// Core business logic for authentication
export class AuthService {
  
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
      // In Express, this should throw an error that the Controller will catch and convert to 409 Conflict
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
}