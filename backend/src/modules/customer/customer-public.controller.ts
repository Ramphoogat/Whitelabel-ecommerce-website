import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-reviews')
@Public()
@Controller('storefront/products/:productId/reviews')
export class CustomerPublicController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List approved reviews for a product' })
  listReviews(@Param('productId') productId: string) {
    return this.customerService.listApprovedReviewsForProduct(productId);
  }
}
