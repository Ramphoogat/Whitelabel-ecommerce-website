import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

/**
 * Third-party sign-in for storefront customers. In production this would
 * carry the provider's ID token and be verified server-side; here the
 * client sends the profile the provider returned.
 */
export class SocialLoginCustomerDto {
  @ApiProperty({ example: 'google', enum: ['google', 'apple', 'facebook'] })
  @IsIn(['google', 'apple', 'facebook'])
  provider!: 'google' | 'apple' | 'facebook';

  @ApiProperty({ example: 'shopper@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Nisha Verma' })
  @IsString()
  @MinLength(2)
  name!: string;
}
