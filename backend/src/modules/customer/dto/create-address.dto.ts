import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Nisha Verma' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: '221B Bandra West' })
  @IsString()
  line1!: string;

  @ApiProperty({ example: 'Near Linking Road', required: false })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'Maharashtra' })
  @IsString()
  state!: string;

  @ApiProperty({ example: '400050' })
  @IsString()
  postalCode!: string;

  @ApiProperty({ example: 'IN', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
