import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import {
  CustomerRefreshToken,
  CustomerRefreshTokenSchema,
} from './schemas/customer-refresh-token.schema';
import { Address, AddressSchema } from './schemas/address.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { CustomerService } from './customer.service';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerController } from './customer.controller';
import { CustomerPublicController } from './customer-public.controller';
import { CustomerAdminController } from './customer-admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerRefreshToken.name, schema: CustomerRefreshTokenSchema },
      { name: Address.name, schema: AddressSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    JwtModule.register({}),
  ],
  controllers: [
    CustomerAuthController,
    CustomerController,
    CustomerPublicController,
    CustomerAdminController,
  ],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}
