import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-catalog')
@Public()
@Controller('storefront/products')
export class CatalogPublicController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  @ApiOperation({ summary: 'List active products (paginated, filterable, sortable)' })
  listProducts(@Query() query: ProductQueryDto) {
    return this.catalogService.listPublicProducts(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get one active product by slug, with its variants' })
  getProduct(@Param('slug') slug: string) {
    return this.catalogService.getPublicProductBySlug(slug);
  }
}
