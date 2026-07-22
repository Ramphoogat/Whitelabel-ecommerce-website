import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { NotificationChannel } from './notification-channel-config.schema';

export type NotificationTemplateDocument = HydratedDocument<NotificationTemplate>;

@Schema({ timestamps: true, collection: 'notification_templates' })
export class NotificationTemplate extends Document {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true, enum: ['email', 'sms'] })
  channel!: NotificationChannel;

  @Prop({ default: '' })
  subjectTemplate!: string;

  @Prop({ required: true })
  bodyTemplate!: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);
NotificationTemplateSchema.index({ key: 1 }, { unique: true });
