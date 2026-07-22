import { Module, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Coupon, CouponSchema } from '../marketing/schemas/coupon.schema';
import { InventoryItem, InventoryItemSchema } from '../inventory/schemas/inventory-item.schema';
import { SchedulerService, COUPON_EXPIRY_QUEUE, STOCK_RECONCILE_QUEUE } from './scheduler.service';
import { CouponExpiryProcessor } from './coupon-expiry.processor';
import { StockReconcileProcessor } from './stock-reconcile.processor';
import { SchedulerAdminController } from './scheduler-admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
    ]),
    BullModule.registerQueue(
      { name: COUPON_EXPIRY_QUEUE },
      { name: STOCK_RECONCILE_QUEUE },
    ),
  ],
  controllers: [SchedulerAdminController],
  providers: [SchedulerService, CouponExpiryProcessor, StockReconcileProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule implements OnApplicationBootstrap {
  private readonly logger = new Logger(SchedulerModule.name);

  constructor(
    @InjectQueue(COUPON_EXPIRY_QUEUE) private readonly couponQueue: Queue,
    @InjectQueue(STOCK_RECONCILE_QUEUE) private readonly stockQueue: Queue,
  ) {}

  /** Register repeatable jobs once on startup. BullMQ deduplicates by jobId. */
  async onApplicationBootstrap() {
    try {
      await this.couponQueue.add(
        'expire-coupons',
        {},
        {
          repeat: { every: 60 * 60 * 1000 },
          removeOnComplete: 5,
          jobId: 'coupon-expiry-repeatable',
        },
      );

      await this.stockQueue.add(
        'reconcile-stock',
        {},
        {
          repeat: { every: 6 * 60 * 60 * 1000 },
          removeOnComplete: 5,
          jobId: 'stock-reconcile-repeatable',
        },
      );
    } catch (err) {
      this.logger.warn(
        `Redis unavailable — scheduled jobs not registered. Start Redis to enable background workers. (${(err as Error).message})`,
      );
    }
  }
}
