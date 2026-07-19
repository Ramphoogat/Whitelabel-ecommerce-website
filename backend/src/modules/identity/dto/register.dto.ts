import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'owner@mystore.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'a-strong-password-123' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Store Owner' })
  @IsString()
  @MinLength(2)
  name!: string;
}
