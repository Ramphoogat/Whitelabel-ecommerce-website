import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentCustomer } from '../../shared/decorators/current-customer.decorator';
import { JwtCustomerGuard } from '../../shared/guards/jwt-customer.guard';
import { JwtCustomerPayload } from '../../shared/interfaces/jwt-payload.interface';

@ApiTags('customer')
@ApiBearerAuth()
@UseGuards(JwtCustomerGuard)
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // ----- Profile -----

  @Get('profile')
  @ApiOperation({ summary: "Get the logged-in customer's profile" })
  getProfile(@CurrentCustomer() customer: JwtCustomerPayload) {
    return this.customerService.getProfile(customer.sub);
  }

  @Patch('profile')
  @ApiOperation({ summary: "Update the logged-in customer's profile" })
  updateProfile(@CurrentCustomer() customer: JwtCustomerPayload, @Body() dto: UpdateProfileDto) {
    return this.customerService.updateProfile(customer.sub, dto);
  }

  // ----- Addresses -----

  @Post('addresses')
  @ApiOperation({ summary: 'Add a shipping address' })
  createAddress(@CurrentCustomer() customer: JwtCustomerPayload, @Body() dto: CreateAddressDto) {
    return this.customerService.createAddress(customer.sub, dto);
  }

  @Get('addresses')
  @ApiOperation({ summary: 'List saved addresses' })
  listAddresses(@CurrentCustomer() customer: JwtCustomerPayload) {
    return this.customerService.listAddresses(customer.sub);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update a saved address' })
  updateAddress(
    @CurrentCustomer() customer: JwtCustomerPayload,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customerService.updateAddress(customer.sub, id, dto);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete a saved address' })
  deleteAddress(@CurrentCustomer() customer: JwtCustomerPayload, @Param('id') id: string) {
    return this.customerService.deleteAddress(customer.sub, id);
  }

  // ----- Wishlist -----

  @Get('wishlist')
  @ApiOperation({ summary: 'List wishlisted products' })
  getWishlist(@CurrentCustomer() customer: JwtCustomerPayload) {
    return this.customerService.getWishlist(customer.sub);
  }

  @Post('wishlist')
  @ApiOperation({ summary: 'Add a product to the wishlist' })
  addToWishlist(@CurrentCustomer() customer: JwtCustomerPayload, @Body() dto: AddToWishlistDto) {
    return this.customerService.addToWishlist(customer.sub, dto.productId);
  }

  @Delete('wishlist/:productId')
  @ApiOperation({ summary: 'Remove a product from the wishlist' })
  removeFromWishlist(
    @CurrentCustomer() customer: JwtCustomerPayload,
    @Param('productId') productId: string,
  ) {
    return this.customerService.removeFromWishlist(customer.sub, productId);
  }

  // ----- Compare list -----

  @Get('compare')
  @ApiOperation({ summary: 'List products in the compare list' })
  getCompareList(@CurrentCustomer() customer: JwtCustomerPayload) {
    return this.customerService.getCompareList(customer.sub);
  }

  @Post('compare')
  @ApiOperation({ summary: 'Add a product to the compare list' })
  addToCompare(@CurrentCustomer() customer: JwtCustomerPayload, @Body() dto: AddToWishlistDto) {
    return this.customerService.addToCompare(customer.sub, dto.productId);
  }

  @Delete('compare/:productId')
  @ApiOperation({ summary: 'Remove a product from the compare list' })
  removeFromCompare(
    @CurrentCustomer() customer: JwtCustomerPayload,
    @Param('productId') productId: string,
  ) {
    return this.customerService.removeFromCompare(customer.sub, productId);
  }

  // ----- Reviews -----

  @Post('reviews')
  @ApiOperation({ summary: 'Submit a product review (goes to pending until moderated)' })
  createReview(@CurrentCustomer() customer: JwtCustomerPayload, @Body() dto: CreateReviewDto) {
    return this.customerService.createReview(customer.sub, dto);
  }
}
