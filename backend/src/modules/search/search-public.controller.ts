import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsArray, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchService } from './search.service';
import { Public } from '../../shared/decorators/public.decorator';

class SearchQueryDto {
  @IsString()
  q!: string;

  @IsOptional()
  @IsArray()
  @IsIn(['product', 'category', 'blog_post', 'page'], { each: true })
  types?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

@ApiTags('storefront-search')
@Public()
@Controller('storefront/search')
export class SearchPublicController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Full-text search across products, categories, blog posts, and pages',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({ name: 'types', required: false, isArray: true, description: 'Filter by content type' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(@Query() dto: SearchQueryDto) {
    return this.searchService.search(dto.q, dto.types, dto.limit ?? 20);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Product title suggestions for a search-as-you-type input' })
  @ApiQuery({ name: 'q', required: true })
  autocomplete(@Query('q') q: string) {
    return this.searchService.autocomplete(q);
  }
}
