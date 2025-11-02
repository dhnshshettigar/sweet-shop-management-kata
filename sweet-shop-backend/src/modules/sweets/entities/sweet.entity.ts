// src/modules/sweets/entities/sweet.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('sweets')
export class Sweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  category: string; // e.g., 'Chocolate', 'Gummy', 'Hard Candy'

  @Column('decimal', { precision: 10, scale: 2 }) // Store price as a precise decimal
  price: number;

  @Column('int')
  quantity: number; // Stock level
}