import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-inventory')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/inventory')
export class InventoryAdminController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('variant/:variantId')
  @ApiOperation({ summary: 'Get current stock for one variant' })
  getStock(@Param('variantId') variantId: string) {
    return this.inventoryService.getStockForVariant(variantId);
  }

  @Post('adjust')
  @ApiOperation({ summary: 'Manually restock or correct stock for a variant' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'List variants at or below their low-stock threshold' })
  lowStock() {
    return this.inventoryService.listLowStock();
  }
}
