// src/modules/sweets/dto/create-sweet.dto.ts
import { IsString, IsNumber, Min, IsPositive, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSweetDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  category: string; 

  @Type(() => Number) // Ensures the value is treated as a number
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with up to 2 decimal places' })
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number; // Stock level
}