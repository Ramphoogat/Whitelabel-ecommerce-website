import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CHECKOUT_EXPIRY_QUEUE } from './checkout.service';
import { CheckoutService } from './checkout.service';

@Processor(CHECKOUT_EXPIRY_QUEUE)
export class CheckoutExpiryProcessor extends WorkerHost {
  constructor(private readonly checkoutService: CheckoutService) {
    super();
  }

  async process(job: Job<{ sessionId: string }>): Promise<void> {
    await this.checkoutService.expireSessionIfStillOpen(job.data.sessionId);
  }
}
