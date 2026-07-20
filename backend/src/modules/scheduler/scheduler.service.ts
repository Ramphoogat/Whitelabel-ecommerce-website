import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const COUPON_EXPIRY_QUEUE = 'coupon-expiry';
export const STOCK_RECONCILE_QUEUE = 'stock-reconcile';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectQueue(COUPON_EXPIRY_QUEUE) private readonly couponQueue: Queue,
    @InjectQueue(STOCK_RECONCILE_QUEUE) private readonly stockQueue: Queue,
  ) {}

  /** Enqueue an immediate coupon-expiry sweep (also runs on schedule via repeatable job). */
  async triggerCouponExpiry() {
    const job = await this.couponQueue.add('expire-coupons', {}, { removeOnComplete: 10 });
    this.logger.log(`Enqueued coupon-expiry job ${job.id}`);
    return { jobId: job.id };
  }

  /** Enqueue an immediate stock reconciliation sweep. */
  async triggerStockReconcile() {
    const job = await this.stockQueue.add('reconcile-stock', {}, { removeOnComplete: 10 });
    this.logger.log(`Enqueued stock-reconcile job ${job.id}`);
    return { jobId: job.id };
  }
}
