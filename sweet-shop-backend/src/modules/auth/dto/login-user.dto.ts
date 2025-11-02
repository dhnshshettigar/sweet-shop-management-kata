// src/modules/auth/dto/login-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail({}, { message: 'Must be a valid email address.' })
  email: string;

  @IsString()
  // We check for a minimum length, though bcrypt check is the primary security measure
  @MinLength(8, { message: 'Password must be at least 8 characters long.' }) 
  password: string;
}