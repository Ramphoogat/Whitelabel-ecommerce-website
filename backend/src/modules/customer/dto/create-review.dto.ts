import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: '6650a1f2c1d4e5a6b7c8d9e0' })
  @IsMongoId()
  productId!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty({ example: 'Runs true to size', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Cut from a nice heavyweight linen, holds up well after washing.' })
  @IsString()
  @MinLength(10)
  body!: string;
}
