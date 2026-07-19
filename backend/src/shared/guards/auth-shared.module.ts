import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStaffGuard } from './jwt-staff.guard';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  providers: [JwtStaffGuard, RolesGuard],
  exports: [JwtModule, JwtStaffGuard, RolesGuard],
})
export class AuthSharedModule {}
