import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ShippingCarrierConfig,
  ShippingCarrierConfigDocument,
} from './schemas/shipping-carrier-config.schema';
import { Shipment, ShipmentDocument } from './schemas/shipment.schema';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { UpdateCarrierConfigDto } from './dto/update-carrier-config.dto';
import { SUPPORTED_CARRIERS, createShippingProvider } from '../../providers/shipping/shipping.factory';
import { decrypt, encrypt } from '../../shared/utils/encryption.util';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class ShippingService {
  constructor(
    @InjectModel(ShippingCarrierConfig.name)
    private readonly carrierModel: Model<ShippingCarrierConfigDocument>,
    @InjectModel(Shipment.name) private readonly shipmentModel: Model<ShipmentDocument>,
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    private readonly config: ConfigService,
    private readonly organizationService: OrganizationService,
  ) {}

  async listCarriersForAdmin() {
    const docs = await this.carrierModel.find().sort({ priority: 1 }).lean();
    return docs.map((doc) => ({
      id: doc._id,
      carrier: doc.carrier,
      isActive: doc.isActive,
      priority: doc.priority,
      hasCredentialsConfigured: Object.keys(doc.encryptedCredentials || {}).length > 0,
    }));
  }

  async upsertCarrierForAdmin(carrier: string, dto: UpdateCarrierConfigDto) {
    if (!SUPPORTED_CARRIERS.includes(carrier)) {
      throw new NotFoundException(
        `"${carrier}" is not an implemented carrier. Supported: ${SUPPORTED_CARRIERS.join(', ')}`,
      );
    }

    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;
    const update: Partial<ShippingCarrierConfig> = {};
    if (dto.isActive !== undefined) update.isActive = dto.isActive;
    if (dto.priority !== undefined) update.priority = dto.priority;

    if (dto.credentials) {
      const encryptedCredentials: Record<string, string> = {};
      for (const [key, value] of Object.entries(dto.credentials)) {
        encryptedCredentials[key] = encrypt(value, secret);
      }
      update.encryptedCredentials = encryptedCredentials;
    }

    const doc = await this.carrierModel.findOneAndUpdate(
      { carrier },
      { $set: update, $setOnInsert: { carrier } },
      { new: true, upsert: true },
    );

    return {
      id: doc._id,
      carrier: doc.carrier,
      isActive: doc.isActive,
      priority: doc.priority,
    };
  }

  async createShipmentForOrder(orderId: string, carrierName: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const existing = await this.shipmentModel.findOne({ orderId: order._id });
    if (existing) return existing;

    const carrierConfig = await this.carrierModel.findOne({ carrier: carrierName, isActive: true });
    if (!carrierConfig) {
      throw new NotFoundException(`Carrier "${carrierName}" is not active`);
    }

    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;
    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(carrierConfig.encryptedCredentials || {})) {
      credentials[key] = decrypt(value, secret);
    }

    const provider = createShippingProvider(carrierName, credentials);

    // Swapped over from the temporary STORE_ORIGIN_* ENV vars (Phase 5) now
    // that the Organization module exists -- this is admin-editable via
    // PATCH /admin/organization/origin-address, no redeploy needed.
    const storedOrigin = await this.organizationService.getOriginAddress();
    const origin = {
      name: storedOrigin.name,
      phone: storedOrigin.phone,
      line1: storedOrigin.line1,
      line2: storedOrigin.line2 || undefined,
      city: storedOrigin.city,
      state: storedOrigin.state,
      pincode: storedOrigin.pincode,
      country: storedOrigin.country,
    };

    // NOTE: destination address isn't collected anywhere yet -- the Customer
    // module (addresses) hasn't been built. Using a placeholder so the
    // shipment-creation flow is wired end-to-end; swap for the real shipping
    // address captured at checkout once that module exists.
    const destinationPlaceholder = { ...origin, name: 'Customer (address TBD)' };

    const result = await provider.createShipment({
      orderReference: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.sku,
        sku: item.sku,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      })),
      weightGrams: 500, // placeholder -- variant weight should be summed here once available on the order snapshot
      destination: destinationPlaceholder,
      origin,
      codAmountCents: order.paymentGateway === 'cod' ? order.totalCents : undefined,
    });

    return this.shipmentModel.create({
      orderId: order._id,
      carrier: carrierName,
      carrierShipmentId: result.carrierShipmentId,
      trackingNumber: result.trackingNumber,
      trackingUrl: result.trackingUrl,
      status: 'label_created',
    });
  }

  async trackShipment(orderId: string) {
    const shipment = await this.shipmentModel.findOne({ orderId: new Types.ObjectId(orderId) });
    if (!shipment) throw new NotFoundException('No shipment found for this order');

    const carrierConfig = await this.carrierModel.findOne({ carrier: shipment.carrier });
    if (!carrierConfig) throw new NotFoundException('Carrier config not found');

    const secret = this.config.get<string>('security.credentialsEncryptionKey')!;
    const credentials: Record<string, string> = {};
    for (const [key, value] of Object.entries(carrierConfig.encryptedCredentials || {})) {
      credentials[key] = decrypt(value, secret);
    }

    const provider = createShippingProvider(shipment.carrier, credentials);
    const tracking = await provider.trackShipment(shipment.carrierShipmentId);

    shipment.status = tracking.status;
    shipment.checkpoints = tracking.checkpoints;
    await shipment.save();

    return shipment;
  }
}
