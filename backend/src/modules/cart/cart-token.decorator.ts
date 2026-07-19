import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CART_TOKEN_HEADER = 'x-cart-token';

export const CartToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers[CART_TOKEN_HEADER];
  },
);
