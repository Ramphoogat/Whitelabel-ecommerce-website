import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type OrganizationSettingsDocument = HydratedDocument<OrganizationSettings>;

@Schema({ _id: false })
export class ThemeSettings {
  @Prop({ default: '#1a1a1a' })
  primaryColor!: string;

  @Prop({ default: '#f5f5f5' })
  secondaryColor!: string;

  @Prop({ default: '' })
  logoUrl!: string;

  @Prop({ default: 'Inter' })
  fontFamily!: string;

  @Prop({ default: false })
  darkModeDefault!: boolean;
}

export const ThemeSettingsSchema = SchemaFactory.createForClass(ThemeSettings);

@Schema({ _id: false })
export class OriginAddress {
  @Prop({ default: '' })
  name!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: '' })
  line1!: string;

  @Prop({ default: '' })
  line2!: string;

  @Prop({ default: '' })
  city!: string;

  @Prop({ default: '' })
  state!: string;

  @Prop({ default: '' })
  pincode!: string;

  @Prop({ default: 'India' })
  country!: string;
}

export const OriginAddressSchema = SchemaFactory.createForClass(OriginAddress);

/**
 * There is exactly one document in this collection -- this is the
 * single-tenant-per-deployment model (§1 of the architecture doc), so store
 * settings aren't scoped by any tenant/organization id, there's just one.
 */
@Schema({ timestamps: true, collection: 'organization_settings' })
export class OrganizationSettings extends Document {
  @Prop({ required: true, default: 'My Store' })
  storeName!: string;

  @Prop({ required: true, default: 'fashion' })
  businessType!: string;

  @Prop({ required: true, default: 'INR' })
  currency!: string;

  @Prop({ required: true, default: 'en' })
  language!: string;

  @Prop({ type: ThemeSettingsSchema, default: () => ({}) })
  theme!: ThemeSettings;

  @Prop({ type: OriginAddressSchema, default: () => ({}) })
  originAddress!: OriginAddress;
}

export const OrganizationSettingsSchema = SchemaFactory.createForClass(OrganizationSettings);
