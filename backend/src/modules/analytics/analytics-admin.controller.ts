import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-analytics')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/analytics')
export class AnalyticsAdminController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Store overview: total orders, revenue, orders by status, low stock, top products',
  })
  getDashboard() {
    return this.analyticsService.getDashboard();
  }
}
