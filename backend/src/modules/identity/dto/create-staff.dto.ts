import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'priya@mystore.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'a-strong-password-123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'staff', enum: ['staff', 'admin'] })
  @IsIn(['staff', 'admin'])
  role!: 'staff' | 'admin';
}
