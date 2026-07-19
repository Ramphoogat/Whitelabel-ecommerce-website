import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStaffGuard } from './jwt-staff.guard';
import { JwtCustomerGuard } from './jwt-customer.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtStaffGuard, JwtCustomerGuard, RolesGuard],
  exports: [JwtModule, JwtStaffGuard, JwtCustomerGuard, RolesGuard],
})
export class AuthSharedModule {}
