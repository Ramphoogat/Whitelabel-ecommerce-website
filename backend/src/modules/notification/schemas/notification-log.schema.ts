import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { NotificationChannel } from './notification-channel-config.schema';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

@Schema({ timestamps: true, collection: 'notification_logs' })
export class NotificationLog extends Document {
  @Prop({ required: true, enum: ['email', 'sms'] })
  channel!: NotificationChannel;

  @Prop({ required: true })
  templateKey!: string;

  @Prop({ required: true })
  recipient!: string;

  @Prop({ required: true, enum: ['sent', 'failed'] })
  status!: 'sent' | 'failed';

  @Prop({ default: '' })
  providerMessageId!: string;

  @Prop({ default: '' })
  error!: string;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);
NotificationLogSchema.index({ createdAt: -1 });
