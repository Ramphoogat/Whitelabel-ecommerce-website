import { Body, Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartToken, CART_TOKEN_HEADER } from './cart-token.decorator';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('storefront-cart')
@ApiHeader({
  name: CART_TOKEN_HEADER,
  required: false,
  description: 'Guest cart token — omit on first call, then send back the value returned in the response header of every call after that',
})
@Public()
@Controller('storefront/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  private setTokenHeader(res: Response, guestToken: string) {
    res.setHeader(CART_TOKEN_HEADER, guestToken);
  }

  @Get()
  @ApiOperation({ summary: 'Get the current cart (creates an empty one if no token given)' })
  async getCart(@CartToken() token: string | undefined, @Res({ passthrough: true }) res: Response) {
    const view = await this.cartService.getCartView(token);
    this.setTokenHeader(res, view.guestToken);
    return view;
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item to the cart (or increase quantity if already present)' })
  async addItem(
    @CartToken() token: string | undefined,
    @Body() dto: AddCartItemDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const view = await this.cartService.addItem(token, dto);
    this.setTokenHeader(res, view.guestToken);
    return view;
  }

  @Put('items/:variantId')
  @ApiOperation({ summary: 'Set an item quantity (0 removes it)' })
  async updateItem(
    @CartToken() token: string | undefined,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateCartItemDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const view = await this.cartService.updateItem(token, variantId, dto);
    this.setTokenHeader(res, view.guestToken);
    return view;
  }

  @Delete('items/:variantId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  async removeItem(
    @CartToken() token: string | undefined,
    @Param('variantId') variantId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const view = await this.cartService.removeItem(token, variantId);
    this.setTokenHeader(res, view.guestToken);
    return view;
  }
}
