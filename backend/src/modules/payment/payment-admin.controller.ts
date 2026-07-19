import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentGatewayConfigService } from './payment-gateway-config.service';
import { UpdateGatewayConfigDto } from './dto/update-gateway-config.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtStaffPayload } from '../../shared/interfaces/jwt-payload.interface';
import { AuditService } from '../audit/audit.service';

@ApiTags('admin-payments')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/payment-gateways')
export class PaymentAdminController {
  constructor(
    private readonly service: PaymentGatewayConfigService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all configured payment gateways (credentials excluded)' })
  list() {
    return this.service.listForAdmin();
  }

  @Patch(':provider')
  @ApiOperation({
    summary:
      'Enable/disable a gateway, set its supported modes, priority, or update credentials',
  })
  async update(
    @Param('provider') provider: string,
    @Body() dto: UpdateGatewayConfigDto,
    @CurrentUser() actor: JwtStaffPayload,
  ) {
    const result = await this.service.upsertForAdmin(provider, dto);

    // Never log the credentials themselves — only which fields changed.
    await this.auditService.log(actor, 'payment_gateway.updated', 'PaymentGatewayConfig', provider, {
      isActive: dto.isActive,
      supportedModes: dto.supportedModes,
      credentialsChanged: Boolean(dto.credentials),
    });

    return result;
  }
}
