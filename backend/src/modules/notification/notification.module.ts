import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import {
  NotificationChannelConfig,
  NotificationChannelConfigSchema,
} from './schemas/notification-channel-config.schema';
import { NotificationTemplate, NotificationTemplateSchema } from './schemas/notification-template.schema';
import { NotificationLog, NotificationLogSchema } from './schemas/notification-log.schema';
import { NotificationService, NOTIFICATION_QUEUE } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { NotificationAdminController } from './notification-admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationChannelConfig.name, schema: NotificationChannelConfigSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
    BullModule.registerQueue({ name: NOTIFICATION_QUEUE }),
  ],
  controllers: [NotificationAdminController],
  providers: [NotificationService, NotificationProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
