import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NOTIFICATION_QUEUE, SendNotificationJobData, NotificationService } from './notification.service';

@Processor(NOTIFICATION_QUEUE)
export class NotificationProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationService) {
    super();
  }

  async process(job: Job<SendNotificationJobData>): Promise<void> {
    await this.notificationService.sendNow(job.data.templateKey, job.data.recipient, job.data.data);
  }
}
