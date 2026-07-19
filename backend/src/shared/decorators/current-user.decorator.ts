import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtStaffPayload } from '../interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtStaffPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
