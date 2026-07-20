import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-customers')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/customers')
export class CustomerAdminController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List all storefront customers' })
  listCustomers() {
    return this.customerService.listCustomersForAdmin();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one customer with their addresses and review history' })
  getCustomer(@Param('id') id: string): Promise<Record<string, unknown>> {
    return this.customerService.getCustomerForAdmin(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a customer account' })
  setActiveStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.customerService.setActiveStatus(id, isActive);
  }

  @Patch('reviews/:id/moderate')
  @ApiOperation({ summary: 'Approve or reject a pending review' })
  moderateReview(@Param('id') id: string, @Body('status') status: 'approved' | 'rejected') {
    return this.customerService.moderateReview(id, status);
  }
}
