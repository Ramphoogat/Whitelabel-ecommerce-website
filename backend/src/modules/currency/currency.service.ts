import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExchangeRate, ExchangeRateDocument } from './schemas/exchange-rate.schema';
import { UpsertExchangeRateDto } from './dto/upsert-exchange-rate.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectModel(ExchangeRate.name)
    private readonly rateModel: Model<ExchangeRateDocument>,
  ) {}

  async listRates() {
    return this.rateModel.find().sort({ baseCurrency: 1, targetCurrency: 1 }).lean();
  }

  async listActiveRates() {
    return this.rateModel.find({ isActive: true }).sort({ baseCurrency: 1, targetCurrency: 1 }).lean();
  }

  async upsertRate(dto: UpsertExchangeRateDto) {
    const base = dto.baseCurrency.toUpperCase();
    const target = dto.targetCurrency.toUpperCase();
    if (base === target) throw new BadRequestException('Base and target currency must differ');

    return this.rateModel.findOneAndUpdate(
      { baseCurrency: base, targetCurrency: target },
      { $set: { rate: dto.rate, isActive: dto.isActive ?? true, rateUpdatedAt: new Date() } },
      { new: true, upsert: true },
    );
  }

  async deleteRate(id: string) {
    const rate = await this.rateModel.findByIdAndDelete(id);
    if (!rate) throw new NotFoundException('Exchange rate not found');
    return { success: true };
  }

  /**
   * Converts an amount from one currency to another.
   * Supports direct rate lookup and triangulation via a common base.
   */
  async convert(amountCents: number, from: string, to: string): Promise<number> {
    if (from === to) return amountCents;

    const direct = await this.rateModel.findOne({
      baseCurrency: from.toUpperCase(),
      targetCurrency: to.toUpperCase(),
      isActive: true,
    });
    if (direct) return Math.round(amountCents * direct.rate);

    const inverse = await this.rateModel.findOne({
      baseCurrency: to.toUpperCase(),
      targetCurrency: from.toUpperCase(),
      isActive: true,
    });
    if (inverse) return Math.round(amountCents / inverse.rate);

    throw new BadRequestException(`No exchange rate found for ${from} → ${to}`);
  }
}
