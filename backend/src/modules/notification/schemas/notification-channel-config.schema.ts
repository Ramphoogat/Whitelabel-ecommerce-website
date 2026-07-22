import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type NotificationChannel = 'email' | 'sms';

export type NotificationChannelConfigDocument = HydratedDocument<NotificationChannelConfig>;

@Schema({ timestamps: true, collection: 'notification_channel_configs' })
export class NotificationChannelConfig extends Document {
  @Prop({ required: true, enum: ['email', 'sms'] })
  channel!: NotificationChannel;

  @Prop({ required: true })
  provider!: string; // 'smtp' | 'sendgrid' for email; 'msg91' | 'twilio' for sms

  @Prop({ default: false })
  isActive!: boolean;

  @Prop({ type: Object, default: {} })
  encryptedCredentials!: Record<string, string>;
}

export const NotificationChannelConfigSchema = SchemaFactory.createForClass(NotificationChannelConfig);
NotificationChannelConfigSchema.index({ channel: 1 }, { unique: true });
