import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

/**
 * Refresh-token rotation with reuse detection:
 * - Every issued refresh token belongs to a `family` (set once at login,
 *   carried forward on each rotation).
 * - Each token is stored only as a hash (never plaintext) — see identity.service.ts.
 * - When a token is used to get a new access token, it's marked `revoked`
 *   and a new one is issued in the same family.
 * - If a *revoked* token is presented again, that's a replay — the entire
 *   family is revoked, forcing re-login (signals possible token theft).
 */
@Schema({ timestamps: true, collection: 'refresh_tokens' })
export class RefreshToken extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  tokenHash!: string;

  @Prop({ required: true, index: true })
  family!: string;

  @Prop({ default: false })
  revoked!: boolean;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Mongo TTL auto-cleanup
