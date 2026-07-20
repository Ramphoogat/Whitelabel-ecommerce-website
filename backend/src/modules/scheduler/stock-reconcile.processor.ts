import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import { InventoryItem, InventoryItemDocument } from '../inventory/schemas/inventory-item.schema';
import { STOCK_RECONCILE_QUEUE } from './scheduler.service';

@Processor(STOCK_RECONCILE_QUEUE)
export class StockReconcileProcessor extends WorkerHost {
  private readonly logger = new Logger(StockReconcileProcessor.name);

  constructor(
    @InjectModel(InventoryItem.name)
    private readonly inventoryModel: Model<InventoryItemDocument>,
  ) {
    super();
  }

  /**
   * Finds inventory items where reservedQuantity has drifted below 0 (can
   * happen if a crash interrupted a release) and resets them to 0. Also
   * detects items where availableQuantity < 0 and clamps to 0 — a defensive
   * guard against race conditions that bypass the atomic filter.
   */
  async process(job: Job): Promise<{ fixedNegativeReserved: number; fixedNegativeAvailable: number }> {
    this.logger.log(`Processing stock reconciliation job ${job.id}`);

    const negReserved = await this.inventoryModel.updateMany(
      { reservedQuantity: { $lt: 0 } },
      { $set: { reservedQuantity: 0 } },
    );

    const negAvailable = await this.inventoryModel.updateMany(
      { availableQuantity: { $lt: 0 } },
      { $set: { availableQuantity: 0 } },
    );

    const result = {
      fixedNegativeReserved: negReserved.modifiedCount,
      fixedNegativeAvailable: negAvailable.modifiedCount,
    };

    if (result.fixedNegativeReserved || result.fixedNegativeAvailable) {
      this.logger.warn(`Stock reconciliation fixed issues: ${JSON.stringify(result)}`);
    } else {
      this.logger.log('Stock reconciliation: no anomalies found');
    }

    return result;
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Stock reconcile job ${job.id} failed: ${err.message}`);
  }
}
