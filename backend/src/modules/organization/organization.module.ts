import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationSettings, OrganizationSettingsSchema } from './schemas/organization-settings.schema';
import { OrganizationService } from './organization.service';
import { OrganizationAdminController } from './organization-admin.controller';
import { OrganizationPublicController } from './organization-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationSettings.name, schema: OrganizationSettingsSchema },
    ]),
  ],
  controllers: [OrganizationAdminController, OrganizationPublicController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
