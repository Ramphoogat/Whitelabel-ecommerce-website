import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-audit')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/audit-logs')
export class AuditAdminController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(@Query('entityType') entityType?: string) {
    return this.auditService.list(entityType);
  }
}
