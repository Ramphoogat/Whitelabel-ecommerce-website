import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { User, UserSchema } from './schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { StaffAdminController } from './staff-admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    // JwtModule is already provided globally by AuthSharedModule, but
    // importing it again here is harmless (Nest dedupes) and keeps this
    // module runnable/testable in isolation if extracted later.
    JwtModule.register({}),
  ],
  controllers: [IdentityController, StaffAdminController],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
