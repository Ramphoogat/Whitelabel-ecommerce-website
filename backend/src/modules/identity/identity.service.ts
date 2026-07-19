import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';
import { User, UserDocument } from './schemas/user.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtStaffPayload } from '../../shared/interfaces/jwt-payload.interface';

@Injectable()
export class IdentityService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * First registered user becomes "owner" automatically (there's no
   * separate platform-admin seeding step needed for the single-tenant model —
   * whoever sets up the store first owns it). Everyone after that registers
   * as "staff" and an owner/admin must promote them via the admin panel.
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const userCount = await this.userModel.countDocuments();
    const role = userCount === 0 ? 'owner' : 'staff';

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const user = await this.userModel.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role,
    });

    return this.issueTokenPair(user, this.newFamily());
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await user.save();

    return this.issueTokenPair(user, this.newFamily());
  }

  /**
   * Rotation + reuse detection:
   * 1. Hash the presented token, look it up.
   * 2. Not found / expired -> reject.
   * 3. Found but already revoked -> this token was used before (replay) ->
   *    revoke the ENTIRE family, force re-login.
   * 4. Found and not revoked -> revoke it, issue a new pair in the same family.
   */
  async refresh(rawRefreshToken: string): Promise<AuthResponseDto> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.refreshTokenModel.findOne({ tokenHash });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (stored.revoked) {
      await this.refreshTokenModel.updateMany(
        { family: stored.family },
        { $set: { revoked: true } },
      );
      throw new UnauthorizedException(
        'Refresh token reuse detected — all sessions in this chain have been revoked. Please log in again.',
      );
    }

    const user = await this.userModel.findById(stored.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account no longer active');
    }

    stored.revoked = true;
    await stored.save();

    return this.issueTokenPair(user, stored.family);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.refreshTokenModel.findOne({ tokenHash });
    if (stored) {
      await this.refreshTokenModel.updateMany(
        { family: stored.family },
        { $set: { revoked: true } },
      );
    }
  }

  private async issueTokenPair(
    user: UserDocument,
    family: string,
  ): Promise<AuthResponseDto> {
    const payload: JwtStaffPayload = {
      sub: (user._id as Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('security.jwtAccessSecret'),
      expiresIn: this.config.get<string>('security.jwtAccessExpiresIn'),
    });

    const rawRefreshToken = randomBytes(48).toString('hex');
    const refreshExpiresIn = this.config.get<string>('security.jwtRefreshExpiresIn')!;

    await this.refreshTokenModel.create({
      userId: user._id,
      tokenHash: this.hashToken(rawRefreshToken),
      family,
      revoked: false,
      expiresAt: this.addDuration(new Date(), refreshExpiresIn),
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      user: {
        id: (user._id as Types.ObjectId).toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  private newFamily(): string {
    return randomBytes(16).toString('hex');
  }

  private hashToken(rawToken: string): string {
    // Refresh tokens are opaque random strings, not JWTs — plain SHA-256 is
    // fine (and fast) here since they're high-entropy, unlike passwords.
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private addDuration(date: Date, duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Fallback: treat as days if the format isn't recognized
      return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
    return new Date(date.getTime() + amount * unitMs);
  }
}
