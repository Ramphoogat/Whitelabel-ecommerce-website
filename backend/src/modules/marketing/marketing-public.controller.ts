import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannerService } from './banner.service';
import { BannerPosition } from './schemas/banner.schema';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-marketing')
@Public()
@Controller('storefront/banners')
export class MarketingPublicController {
  constructor(private readonly bannerService: BannerService) {}

  @Get(':position')
  @ApiOperation({
    summary: 'Active banners for a position (homepage_hero, homepage_secondary, category_top)',
  })
  getBanners(@Param('position') position: BannerPosition) {
    return this.bannerService.listActiveForPosition(position);
  }
}
