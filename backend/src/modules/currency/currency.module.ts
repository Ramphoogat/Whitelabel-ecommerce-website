import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangeRate, ExchangeRateSchema } from './schemas/exchange-rate.schema';
import { CurrencyService } from './currency.service';
import { CurrencyAdminController } from './currency-admin.controller';
import { CurrencyPublicController } from './currency-public.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExchangeRate.name, schema: ExchangeRateSchema }]),
  ],
  controllers: [CurrencyAdminController, CurrencyPublicController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
