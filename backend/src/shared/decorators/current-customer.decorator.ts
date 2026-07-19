import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtCustomerPayload } from '../interfaces/jwt-payload.interface';

export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtCustomerPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.customer;
  },
);
