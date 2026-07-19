import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InventoryItem, InventoryItemDocument } from './schemas/inventory-item.schema';
import { StockMovement, StockMovementDocument } from './schemas/stock-movement.schema';
import { AdjustStockDto } from './dto/adjust-stock.dto';

export interface ReservationLineItem {
  variantId: string;
  quantity: number;
}

export interface ReservationFailure {
  variantId: string;
  requestedQuantity: number;
  availableQuantity: number;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(InventoryItem.name)
    private readonly inventoryModel: Model<InventoryItemDocument>,
    @InjectModel(StockMovement.name)
    private readonly movementModel: Model<StockMovementDocument>,
  ) {}

  async createInventoryItem(variantId: string, initialQuantity: number) {
    return this.inventoryModel.create({
      variantId: new Types.ObjectId(variantId),
      availableQuantity: initialQuantity,
      reservedQuantity: 0,
    });
  }

  async deleteInventoryItemForVariant(variantId: string) {
    await this.inventoryModel.deleteOne({ variantId: new Types.ObjectId(variantId) });
  }

  async getStockForVariant(variantId: string) {
    const item = await this.inventoryModel.findOne({ variantId: new Types.ObjectId(variantId) });
    if (!item) throw new NotFoundException('No inventory record for this variant');
    return item;
  }

  /** Admin: manual restock or correction — logged as a stock_movements entry. */
  async adjustStock(dto: AdjustStockDto) {
    const item = await this.inventoryModel.findOneAndUpdate(
      { variantId: new Types.ObjectId(dto.variantId) },
      { $inc: { availableQuantity: dto.quantityDelta, version: 1 } },
      { new: true },
    );
    if (!item) throw new NotFoundException('No inventory record for this variant');

    if (item.availableQuantity < 0) {
      // Roll back — this adjustment would put stock negative
      await this.inventoryModel.updateOne(
        { _id: item._id },
        { $inc: { availableQuantity: -dto.quantityDelta, version: 1 } },
      );
      throw new BadRequestException('Adjustment would make available stock negative');
    }

    await this.movementModel.create({
      variantId: item.variantId,
      type: 'manual_adjustment',
      quantityDelta: dto.quantityDelta,
      note: dto.note || '',
    });

    return item;
  }

  /**
   * §5.1 of the architecture doc: atomic per-line-item reservation.
   * Each line item does its own single-document atomic update — no global
   * lock, no multi-document transaction needed for the happy path, so this
   * scales horizontally. If ANY line fails (insufficient stock), everything
   * already reserved in this call is rolled back before returning failures.
   */
  async reserveStock(
    items: ReservationLineItem[],
    reference: string,
  ): Promise<{ success: true } | { success: false; failures: ReservationFailure[] }> {
    const reserved: ReservationLineItem[] = [];
    const failures: ReservationFailure[] = [];

    for (const line of items) {
      const variantObjectId = new Types.ObjectId(line.variantId);

      // The WHERE clause (availableQuantity >= quantity) makes this atomic:
      // if two requests race for the last unit, only one UPDATE matches.
      const updated = await this.inventoryModel.findOneAndUpdate(
        {
          variantId: variantObjectId,
          availableQuantity: { $gte: line.quantity },
        },
        {
          $inc: {
            availableQuantity: -line.quantity,
            reservedQuantity: line.quantity,
            version: 1,
          },
        },
        { new: true },
      );

      if (!updated) {
        const current = await this.inventoryModel.findOne({ variantId: variantObjectId });
        failures.push({
          variantId: line.variantId,
          requestedQuantity: line.quantity,
          availableQuantity: current?.availableQuantity ?? 0,
        });
        break; // stop attempting further lines once one has failed
      }

      reserved.push(line);
      await this.movementModel.create({
        variantId: variantObjectId,
        type: 'reserve',
        quantityDelta: -line.quantity,
        reference,
      });
    }

    if (failures.length > 0) {
      // Roll back everything this call successfully reserved before failing
      await this.releaseStock(reserved, reference, 'auto-rollback: partial reservation failed');
      return { success: false, failures };
    }

    return { success: true };
  }

  /** Releases a reservation back to available stock (checkout expired/cancelled/failed). */
  async releaseStock(
    items: ReservationLineItem[],
    reference: string,
    note = 'released',
  ): Promise<void> {
    for (const line of items) {
      await this.inventoryModel.updateOne(
        { variantId: new Types.ObjectId(line.variantId) },
        {
          $inc: {
            availableQuantity: line.quantity,
            reservedQuantity: -line.quantity,
            version: 1,
          },
        },
      );
      await this.movementModel.create({
        variantId: new Types.ObjectId(line.variantId),
        type: 'release',
        quantityDelta: line.quantity,
        reference,
        note,
      });
    }
  }

  /** Converts a reservation into a permanent deduction (payment succeeded). */
  async fulfillReservation(items: ReservationLineItem[], reference: string): Promise<void> {
    for (const line of items) {
      await this.inventoryModel.updateOne(
        { variantId: new Types.ObjectId(line.variantId) },
        { $inc: { reservedQuantity: -line.quantity, version: 1 } },
      );
      await this.movementModel.create({
        variantId: new Types.ObjectId(line.variantId),
        type: 'fulfill',
        quantityDelta: -line.quantity,
        reference,
      });
    }
  }

  async listLowStock(thresholdOverride?: number) {
    const items = await this.inventoryModel.find().lean();
    return items.filter(
      (i) => i.availableQuantity <= (thresholdOverride ?? i.lowStockThreshold),
    );
  }
}
