import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { InventoryService } from './inventory.service';
import { InventoryItem } from './schemas/inventory-item.schema';
import { StockMovement } from './schemas/stock-movement.schema';

const VARIANT_ID = new Types.ObjectId().toHexString();

function makeInventoryDoc(overrides = {}) {
  return {
    _id: new Types.ObjectId().toHexString(),
    variantId: VARIANT_ID,
    sku: 'SKU-001',
    availableQuantity: 20,
    reservedQuantity: 0,
    lowStockThreshold: 5,
    version: 0,
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryModel: any;
  let movementModel: any;

  beforeEach(async () => {
    inventoryModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
    };
    movementModel = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getModelToken(InventoryItem.name), useValue: inventoryModel },
        { provide: getModelToken(StockMovement.name), useValue: movementModel },
      ],
    }).compile();
    service = module.get<InventoryService>(InventoryService);
  });

  describe('reserveStock', () => {
    it('returns success when enough stock is available', async () => {
      inventoryModel.findOneAndUpdate.mockResolvedValue(makeInventoryDoc({ reservedQuantity: 5 }));
      movementModel.create.mockResolvedValue({});

      const result = await service.reserveStock(
        [{ variantId: VARIANT_ID, quantity: 5 }],
        'session-1',
      );
      expect(result.success).toBe(true);
    });

    it('returns failures when stock is insufficient', async () => {
      // findOneAndUpdate returns null = could not reserve (insufficient stock)
      inventoryModel.findOneAndUpdate.mockResolvedValue(null);
      inventoryModel.findOne.mockResolvedValue(makeInventoryDoc({ availableQuantity: 2 }));

      const result = await service.reserveStock(
        [{ variantId: VARIANT_ID, quantity: 10 }],
        'session-1',
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.failures).toHaveLength(1);
        expect(result.failures[0].variantId).toBe(VARIANT_ID);
      }
    });
  });

  describe('listLowStock', () => {
    it('returns items where availableQuantity <= lowStockThreshold', async () => {
      const lowItem = makeInventoryDoc({ availableQuantity: 3, lowStockThreshold: 5 });
      inventoryModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([lowItem]),
      });

      const result = await service.listLowStock();
      expect(result).toHaveLength(1);
    });
  });
});
