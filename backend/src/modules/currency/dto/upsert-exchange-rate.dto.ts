import { IsBoolean, IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertExchangeRateDto {
  @ApiProperty({ example: 'USD' })
  @IsString()
  @Length(3, 3)
  baseCurrency!: string;

  @ApiProperty({ example: 'INR' })
  @IsString()
  @Length(3, 3)
  targetCurrency!: string;

  @ApiProperty({ example: 83.5, description: 'Units of targetCurrency per 1 baseCurrency' })
  @IsNumber()
  @Min(0)
  rate!: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
