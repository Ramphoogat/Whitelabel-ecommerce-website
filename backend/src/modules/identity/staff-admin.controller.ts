import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdentityService } from './identity.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtStaffPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('admin-staff')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/staff')
export class StaffAdminController {
  constructor(private readonly identityService: IdentityService) {}

  @Get()
  @ApiOperation({ summary: 'List all staff users (passwords excluded)' })
  list() {
    return this.identityService.listStaff();
  }

  @Post()
  @ApiOperation({ summary: 'Create a staff or admin account' })
  create(@Body() dto: CreateStaffDto): Promise<Record<string, unknown>> {
    return this.identityService.createStaff(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: "Change a staff member's role or active status (the owner is immutable)" })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() actor: JwtStaffPayload,
  ): Promise<Record<string, unknown>> {
    return this.identityService.updateStaff(id, dto, actor);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently remove a staff member (owner is immutable)' })
  remove(
    @Param('id') id: string,
    @CurrentUser() actor: JwtStaffPayload,
  ): Promise<{ ok: true }> {
    return this.identityService.removeStaff(id, actor);
  }
}
