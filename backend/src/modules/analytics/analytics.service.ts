import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from '../order/schemas/order.schema';
import { InventoryItem, InventoryItemDocument } from '../inventory/schemas/inventory-item.schema';
import { ProductVariant, ProductVariantDocument } from '../catalog/schemas/product-variant.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(InventoryItem.name)
    private readonly inventoryModel: Model<InventoryItemDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  async getDashboard() {
    const revenueEligibleStatuses: OrderStatus[] = ['paid', 'fulfilled'];

    const [totalOrders, revenueAgg, ordersByStatusAgg, recentOrders, lowStockItems, topProductsAgg] =
      await Promise.all([
        this.orderModel.countDocuments(),
        this.orderModel.aggregate([
          { $match: { status: { $in: revenueEligibleStatuses } } },
          { $group: { _id: null, totalCents: { $sum: '$totalCents' } } },
        ]),
        this.orderModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        this.orderModel.find().sort({ createdAt: -1 }).limit(5).lean(),
        this.inventoryModel
          .find({ $expr: { $lte: ['$availableQuantity', '$lowStockThreshold'] } })
          .lean(),
        this.orderModel.aggregate([
          { $match: { status: { $in: revenueEligibleStatuses } } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.sku',
              unitsSold: { $sum: '$items.quantity' },
              revenueCents: { $sum: { $multiply: ['$items.quantity', '$items.unitPriceCents'] } },
            },
          },
          { $sort: { unitsSold: -1 } },
          { $limit: 5 },
        ]),
      ]);

    const ordersByStatus: Record<string, number> = {};
    for (const row of ordersByStatusAgg) {
      ordersByStatus[row._id] = row.count;
    }

    return {
      totalOrders,
      totalRevenueCents: revenueAgg[0]?.totalCents ?? 0,
      ordersByStatus,
      lowStockCount: lowStockItems.length,
      lowStockVariantIds: lowStockItems.map((i) => i.variantId.toString()),
      recentOrders: recentOrders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        status: o.status,
        totalCents: o.totalCents,
        createdAt: (o as { createdAt?: Date }).createdAt,
      })),
      topProducts: topProductsAgg.map((row) => ({
        sku: row._id,
        unitsSold: row.unitsSold,
        revenueCents: row.revenueCents,
      })),
    };
  }
}
