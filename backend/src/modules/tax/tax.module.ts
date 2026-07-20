import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxRate, TaxRateSchema } from './schemas/tax-rate.schema';
import { TaxService } from './tax.service';
import { TaxAdminController } from './tax-admin.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: TaxRate.name, schema: TaxRateSchema }])],
  controllers: [TaxAdminController],
  providers: [TaxService],
  exports: [TaxService],
})
export class TaxModule {}
