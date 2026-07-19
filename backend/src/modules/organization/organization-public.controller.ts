import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-organization')
@Public()
@Controller('storefront/store-config')
export class OrganizationPublicController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  getConfig() {
    return this.organizationService.getPublicStorefrontConfig();
  }
}
