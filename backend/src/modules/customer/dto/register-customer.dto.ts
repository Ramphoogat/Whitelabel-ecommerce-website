import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterCustomerDto {
  @ApiProperty({ example: 'shopper@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'a-strong-password-123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Nisha Verma' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
