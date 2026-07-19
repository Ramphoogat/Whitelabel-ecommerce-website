import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtCustomerPayload } from '../interfaces/jwt-payload.interface';

/** Same shape as JwtStaffGuard, kept separate so a customer token can never pass a staff-guarded route or vice versa. */
@Injectable()
export class JwtCustomerGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtCustomerPayload>(token, {
        secret: this.config.get<string>('security.jwtAccessSecret'),
      });
      if (payload.role !== 'customer') {
        throw new UnauthorizedException('Invalid token for this endpoint');
      }
      request.customer = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private extractToken(request: { headers: Record<string, string | undefined> }): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return null;
    const [scheme, token] = authHeader.split(' ');
    return scheme === 'Bearer' && token ? token : null;
  }
}
