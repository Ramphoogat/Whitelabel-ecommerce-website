import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CouponType } from '../schemas/coupon.schema';

const VALID_TYPES: CouponType[] = ['percentage', 'fixed'];

export class CreateCouponDto {
  @ApiProperty({ example: 'WELCOME10' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: VALID_TYPES })
  @IsIn(VALID_TYPES)
  type!: CouponType;

  @ApiProperty({ description: 'Percentage (0-100) or fixed minor units, depending on type' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderCents?: number;

  @ApiPropertyOptional({ description: 'Caps the discount for percentage coupons' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountCents?: number;

  @ApiPropertyOptional({ description: 'Total redemptions allowed across all customers' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
