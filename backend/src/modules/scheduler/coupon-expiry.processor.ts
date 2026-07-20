import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import { Coupon, CouponDocument } from '../marketing/schemas/coupon.schema';
import { COUPON_EXPIRY_QUEUE } from './scheduler.service';

@Processor(COUPON_EXPIRY_QUEUE)
export class CouponExpiryProcessor extends WorkerHost {
  private readonly logger = new Logger(CouponExpiryProcessor.name);

  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {
    super();
  }

  async process(job: Job): Promise<{ expiredCount: number }> {
    this.logger.log(`Processing coupon expiry job ${job.id}`);

    const result = await this.couponModel.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() },
      },
      { $set: { isActive: false } },
    );

    this.logger.log(`Deactivated ${result.modifiedCount} expired coupon(s)`);
    return { expiredCount: result.modifiedCount };
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Coupon expiry job ${job.id} failed: ${err.message}`);
  }
}
