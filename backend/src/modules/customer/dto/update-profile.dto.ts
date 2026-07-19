import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Nisha Verma', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
