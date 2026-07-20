import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaxRate, TaxRateDocument } from './schemas/tax-rate.schema';
import { CreateTaxRateDto } from './dto/create-tax-rate.dto';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';

export interface TaxCalculationInput {
  subtotalCents: number;
  countryCode?: string;
  stateCode?: string;
  categorySlugs?: string[];
}

export interface TaxCalculationResult {
  taxCents: number;
  breakdown: { name: string; rate: number; type: string; taxCents: number }[];
}

@Injectable()
export class TaxService {
  constructor(
    @InjectModel(TaxRate.name) private readonly taxRateModel: Model<TaxRateDocument>,
  ) {}

  async listRates() {
    return this.taxRateModel.find().sort({ priority: -1, createdAt: 1 }).lean();
  }

  async getRate(id: string) {
    const rate = await this.taxRateModel.findById(id);
    if (!rate) throw new NotFoundException('Tax rate not found');
    return rate;
  }

  async createRate(dto: CreateTaxRateDto) {
    return this.taxRateModel.create({
      ...dto,
      countryCode: dto.countryCode ?? null,
      stateCode: dto.stateCode ?? null,
      categorySlug: dto.categorySlug ?? null,
      description: dto.description ?? null,
    });
  }

  async updateRate(id: string, dto: UpdateTaxRateDto) {
    const rate = await this.taxRateModel.findByIdAndUpdate(id, dto, { new: true });
    if (!rate) throw new NotFoundException('Tax rate not found');
    return rate;
  }

  async deleteRate(id: string) {
    const rate = await this.taxRateModel.findByIdAndDelete(id);
    if (!rate) throw new NotFoundException('Tax rate not found');
    return { success: true };
  }

  /**
   * Finds all active tax rates that match the given context and computes
   * total tax. Rates with countryCode/stateCode/categorySlug null act as
   * wildcards — they match everything.
   */
  async calculateTax(input: TaxCalculationInput): Promise<TaxCalculationResult> {
    const allActive = await this.taxRateModel
      .find({ isActive: true })
      .sort({ priority: -1 })
      .lean();

    const applicable = allActive.filter((r) => {
      if (r.countryCode && r.countryCode !== input.countryCode) return false;
      if (r.stateCode && r.stateCode !== input.stateCode) return false;
      if (r.categorySlug) {
        if (!input.categorySlugs || !input.categorySlugs.includes(r.categorySlug)) return false;
      }
      return true;
    });

    let taxCents = 0;
    const breakdown: TaxCalculationResult['breakdown'] = [];

    for (const r of applicable) {
      const lineTax =
        r.type === 'percentage'
          ? Math.round((input.subtotalCents * r.rate) / 100)
          : r.rate;
      taxCents += lineTax;
      breakdown.push({ name: r.name, rate: r.rate, type: r.type, taxCents: lineTax });
    }

    return { taxCents, breakdown };
  }
}
