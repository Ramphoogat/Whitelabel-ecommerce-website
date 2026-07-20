import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-scheduler')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/scheduler')
export class SchedulerAdminController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('coupon-expiry')
  @ApiOperation({ summary: 'Manually trigger coupon-expiry sweep (runs automatically on schedule)' })
  triggerCouponExpiry() {
    return this.schedulerService.triggerCouponExpiry();
  }

  @Post('stock-reconcile')
  @ApiOperation({ summary: 'Manually trigger stock reconciliation sweep' })
  triggerStockReconcile() {
    return this.schedulerService.triggerStockReconcile();
  }
}
