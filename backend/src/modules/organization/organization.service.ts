import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrganizationSettings, OrganizationSettingsDocument } from './schemas/organization-settings.schema';
import { UpdateOrganizationSettingsDto } from './dto/update-organization-settings.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateOriginAddressDto } from './dto/update-origin-address.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(OrganizationSettings.name)
    private readonly settingsModel: Model<OrganizationSettingsDocument>,
  ) {}

  async getSettings(): Promise<OrganizationSettingsDocument> {
    const existing = await this.settingsModel.findOne();
    if (existing) return existing;

    // First call ever (fresh install) -- create the singleton with defaults.
    return this.settingsModel.create({});
  }

  async updateSettings(dto: UpdateOrganizationSettingsDto) {
    await this.getSettings();
    return this.settingsModel.findOneAndUpdate({}, { $set: dto }, { new: true, upsert: true });
  }

  async updateTheme(dto: UpdateThemeDto) {
    await this.getSettings();
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      update[`theme.${key}`] = value;
    }
    return this.settingsModel.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
  }

  async updateOriginAddress(dto: UpdateOriginAddressDto) {
    await this.getSettings();
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      update[`originAddress.${key}`] = value;
    }
    return this.settingsModel.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
  }

  /** Used by ShippingService -- replaces the temporary STORE_ORIGIN_* ENV vars from Phase 5. */
  async getOriginAddress() {
    const settings = await this.getSettings();
    return settings.originAddress;
  }

  /** Public storefront read -- theme and basic identity only, never the origin address (that's operational, not public). */
  async getPublicStorefrontConfig() {
    const settings = await this.getSettings();
    return {
      storeName: settings.storeName,
      businessType: settings.businessType,
      currency: settings.currency,
      language: settings.language,
      theme: settings.theme,
    };
  }
}
