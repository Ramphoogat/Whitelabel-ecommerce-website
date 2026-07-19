import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginCustomerDto {
  @ApiProperty({ example: 'shopper@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'a-strong-password-123' })
  @IsString()
  @MinLength(8)
  password!: string;
}
