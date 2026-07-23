import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateStaffDto {
  @ApiPropertyOptional({ example: 'admin', enum: ['staff', 'admin'] })
  @IsOptional()
  @IsIn(['staff', 'admin'])
  role?: 'staff' | 'admin';

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: ['orders', 'products'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedSections?: string[] | null;
}
