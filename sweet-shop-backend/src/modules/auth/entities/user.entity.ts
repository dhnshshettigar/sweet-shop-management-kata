// src/modules/auth/entities/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  // 'select: false' is for security: prevents the hashed password from 
  // being fetched by default in most queries.
  @Column({ select: false }) 
  password: string;

  // Default role is 'user', used for authorization checks later.
  @Column({ default: 'user' }) 
  role: string;
}