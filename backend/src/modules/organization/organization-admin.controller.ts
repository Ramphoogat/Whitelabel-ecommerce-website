import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateOriginAddressDto } from './dto/update-origin-address.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-organization')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin')
@Controller('admin/organization')
export class OrganizationAdminController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('settings')
  getSettings() {
    return this.organizationService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateOrganizationSettingsDto) {
    return this.organizationService.updateSettings(dto);
  }

  @Patch('theme')
  updateTheme(@Body() dto: UpdateThemeDto) {
    return this.organizationService.updateTheme(dto);
  }

  @Patch('origin-address')
  updateOriginAddress(@Body() dto: UpdateOriginAddressDto) {
    return this.organizationService.updateOriginAddress(dto);
  }
}
