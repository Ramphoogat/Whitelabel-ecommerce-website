import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as argon2 from 'argon2';
import { randomBytes, createHash } from 'crypto';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import {
  CustomerRefreshToken,
  CustomerRefreshTokenDocument,
} from './schemas/customer-refresh-token.schema';
import { Address, AddressDocument } from './schemas/address.schema';
import { Review, ReviewDocument } from './schemas/review.schema';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { LoginCustomerDto } from './dto/login-customer.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { CustomerAuthResponseDto } from './dto/customer-auth-response.dto';
import { JwtCustomerPayload } from '../../shared/interfaces/jwt-payload.interface';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerRefreshToken.name)
    private readonly refreshTokenModel: Model<CustomerRefreshTokenDocument>,
    @InjectModel(Address.name) private readonly addressModel: Model<AddressDocument>,
    @InjectModel(Review.name) private readonly reviewModel: Model<ReviewDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ----- Auth -----

  async register(dto: RegisterCustomerDto): Promise<CustomerAuthResponseDto> {
    const existing = await this.customerModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const customer = await this.customerModel.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone ?? null,
      authProvider: 'email',
    });

    return this.issueTokenPair(customer, this.newFamily());
  }

  async login(dto: LoginCustomerDto): Promise<CustomerAuthResponseDto> {
    const customer = await this.customerModel.findOne({ email: dto.email });
    if (!customer || !customer.isActive || !customer.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await argon2.verify(customer.passwordHash, dto.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    customer.lastLoginAt = new Date();
    await customer.save();

    return this.issueTokenPair(customer, this.newFamily());
  }

  async refresh(rawRefreshToken: string): Promise<CustomerAuthResponseDto> {
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

    const customer = await this.customerModel.findById(stored.customerId);
    if (!customer || !customer.isActive) {
      throw new UnauthorizedException('Account no longer active');
    }

    stored.revoked = true;
    await stored.save();

    return this.issueTokenPair(customer, stored.family);
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

  // ----- Profile -----

  async getProfile(customerId: string) {
    const customer = await this.customerModel.findById(customerId);
    if (!customer) throw new NotFoundException('Customer not found');
    return {
      id: (customer._id as Types.ObjectId).toString(),
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
    };
  }

  async updateProfile(customerId: string, dto: UpdateProfileDto) {
    const customer = await this.customerModel.findByIdAndUpdate(customerId, dto, { new: true });
    if (!customer) throw new NotFoundException('Customer not found');
    return this.getProfile(customerId);
  }

  // ----- Addresses -----

  createAddress(customerId: string, dto: CreateAddressDto) {
    return this.addressModel.create({ ...dto, customerId });
  }

  listAddresses(customerId: string) {
    return this.addressModel.find({ customerId }).sort({ isDefault: -1, createdAt: -1 });
  }

  async updateAddress(customerId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressModel.findOneAndUpdate(
      { _id: addressId, customerId },
      dto,
      { new: true },
    );
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async deleteAddress(customerId: string, addressId: string) {
    const result = await this.addressModel.deleteOne({ _id: addressId, customerId });
    if (result.deletedCount === 0) throw new NotFoundException('Address not found');
    return { success: true };
  }

  // ----- Wishlist -----

  async addToWishlist(customerId: string, productId: string) {
    await this.customerModel.updateOne(
      { _id: customerId },
      { $addToSet: { wishlist: new Types.ObjectId(productId) } },
    );
    return this.getWishlist(customerId);
  }

  async removeFromWishlist(customerId: string, productId: string) {
    await this.customerModel.updateOne(
      { _id: customerId },
      { $pull: { wishlist: new Types.ObjectId(productId) } },
    );
    return this.getWishlist(customerId);
  }

  async getWishlist(customerId: string) {
    const customer = await this.customerModel.findById(customerId).populate('wishlist');
    if (!customer) throw new NotFoundException('Customer not found');
    return customer.wishlist;
  }

  // ----- Compare list -----

  async addToCompare(customerId: string, productId: string) {
    await this.customerModel.updateOne(
      { _id: customerId },
      { $addToSet: { compareList: new Types.ObjectId(productId) } },
    );
    return this.getCompareList(customerId);
  }

  async removeFromCompare(customerId: string, productId: string) {
    await this.customerModel.updateOne(
      { _id: customerId },
      { $pull: { compareList: new Types.ObjectId(productId) } },
    );
    return this.getCompareList(customerId);
  }

  async getCompareList(customerId: string) {
    const customer = await this.customerModel.findById(customerId).populate('compareList');
    if (!customer) throw new NotFoundException('Customer not found');
    return customer.compareList;
  }

  // ----- Reviews -----

  async createReview(customerId: string, dto: CreateReviewDto) {
    const existing = await this.reviewModel.findOne({ customerId, productId: dto.productId });
    if (existing) {
      throw new ConflictException('You have already reviewed this product');
    }
    return this.reviewModel.create({ ...dto, customerId });
  }

  listApprovedReviewsForProduct(productId: string) {
    return this.reviewModel
      .find({ productId, status: 'approved' })
      .sort({ createdAt: -1 })
      .populate('customerId', 'name');
  }

  async moderateReview(reviewId: string, status: 'approved' | 'rejected') {
    const review = await this.reviewModel.findByIdAndUpdate(reviewId, { status }, { new: true });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  // ----- Admin -----

  async listCustomersForAdmin() {
    return this.customerModel
      .find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
  }

  async getCustomerForAdmin(customerId: string): Promise<Record<string, unknown>> {
    const customer = await this.customerModel.findById(customerId).select('-passwordHash').lean();
    if (!customer) throw new NotFoundException('Customer not found');
    const addresses = await this.addressModel.find({ customerId: customer._id }).lean();
    const reviews = await this.reviewModel
      .find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    return { ...customer, addresses, reviews };
  }

  async setActiveStatus(customerId: string, isActive: boolean) {
    const customer = await this.customerModel.findByIdAndUpdate(
      customerId,
      { isActive },
      { new: true },
    );
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  // ----- Internal -----

  private async issueTokenPair(
    customer: CustomerDocument,
    family: string,
  ): Promise<CustomerAuthResponseDto> {
    const payload: JwtCustomerPayload = {
      sub: (customer._id as Types.ObjectId).toString(),
      email: customer.email,
      role: 'customer',
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('security.jwtAccessSecret'),
      expiresIn: this.config.get<string>('security.jwtAccessExpiresIn'),
    });

    const rawRefreshToken = randomBytes(48).toString('hex');
    const refreshExpiresIn = this.config.get<string>('security.jwtRefreshExpiresIn')!;

    await this.refreshTokenModel.create({
      customerId: customer._id,
      tokenHash: this.hashToken(rawRefreshToken),
      family,
      revoked: false,
      expiresAt: this.addDuration(new Date(), refreshExpiresIn),
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      customer: {
        id: (customer._id as Types.ObjectId).toString(),
        email: customer.email,
        name: customer.name,
      },
    };
  }

  private newFamily(): string {
    return randomBytes(16).toString('hex');
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private addDuration(date: Date, duration: string): Date {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10);
    const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
    return new Date(date.getTime() + amount * unitMs);
  }
}
