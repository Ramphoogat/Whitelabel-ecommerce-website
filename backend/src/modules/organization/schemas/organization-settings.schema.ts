import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type OrganizationSettingsDocument = HydratedDocument<OrganizationSettings>;

/**
 * Mirrors the CSS custom properties the storefront reads (frontend
 * globals.css) -- the merchant edits these from Admin > Settings > Theme and
 * the storefront re-tints at runtime, no rebuild.
 */
@Schema({ _id: false })
export class ThemeSettings {
  // Brand colours
  @Prop({ default: '#4b9ec4' })
  accent!: string;

  @Prop({ default: '#0c2431' })
  accentInk!: string;

  @Prop({ default: '#dcecf4' })
  accentSoft!: string;

  @Prop({ default: '#74b0a0' })
  secondary!: string;

  @Prop({ default: '#dceee7' })
  secondarySoft!: string;

  // Storefront canvas (light theme neutrals)
  @Prop({ default: '#f6f3ec' })
  background!: string;

  @Prop({ default: '#fdfbf7' })
  surface!: string;

  @Prop({ default: '#232830' })
  ink!: string;

  @Prop({ default: '#7c828c' })
  inkSoft!: string;

  @Prop({ default: '#e4e0d4' })
  line!: string;

  // Typography (keys into the frontend's curated font stacks)
  @Prop({ default: 'grotesk' })
  fontDisplay!: string;

  @Prop({ default: 'inter' })
  fontBody!: string;

  @Prop({ default: 'plexmono' })
  fontMono!: string;

  @Prop({ default: 'regular', enum: ['compact', 'regular', 'large'] })
  typeScale!: string;

  @Prop({ default: 'classic', enum: ['subtle', 'classic', 'dramatic'] })
  headingScale!: string;

  // Shape
  @Prop({ default: 'soft', enum: ['sharp', 'soft', 'round'] })
  cornerStyle!: string;

  // ---- Structural: storefront ----
  @Prop({ default: 'split', enum: ['split', 'centered', 'minimal'] })
  headerStyle!: string;

  @Prop({ default: 'editorial', enum: ['editorial', 'immersive', 'minimal'] })
  heroVariant!: string;

  @Prop({ default: 4, enum: [2, 3, 4] })
  gridDensity!: number;

  @Prop({ default: 'glass', enum: ['glass', 'flat', 'outlined'] })
  cardStyle!: string;

  @Prop({ default: 'regular', enum: ['airy', 'regular', 'dense'] })
  sectionSpacing!: string;

  // ---- Structural: admin panel ----
  @Prop({ default: 'expanded', enum: ['expanded', 'compact', 'rail'] })
  sidebarStyle!: string;

  @Prop({ default: 'comfortable', enum: ['comfortable', 'compact'] })
  density!: string;

  @Prop({ default: 'card', enum: ['card', 'flat'] })
  panelStyle!: string;

  @Prop({ default: '' })
  logoUrl!: string;

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

  /** Separate look for the merchant's own dashboard — never served publicly. */
  @Prop({ type: ThemeSettingsSchema, default: () => ({}) })
  adminTheme!: ThemeSettings;

  @Prop({ type: OriginAddressSchema, default: () => ({}) })
  originAddress!: OriginAddress;
}

export const OrganizationSettingsSchema = SchemaFactory.createForClass(OrganizationSettings);
