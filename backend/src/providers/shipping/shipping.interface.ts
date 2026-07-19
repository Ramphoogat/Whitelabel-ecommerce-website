export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface CreateShipmentParams {
  orderReference: string; // our order number, for reconciliation on the carrier's dashboard
  items: { name: string; sku: string; quantity: number; unitPriceCents: number }[];
  weightGrams: number;
  destination: ShippingAddress;
  origin: ShippingAddress;
  codAmountCents?: number; // present only for Cash on Delivery orders
}

export interface CreateShipmentResult {
  carrierShipmentId: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDeliveryDate?: string;
}

export type ShipmentTrackingStatus =
  | 'label_created'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'rto';

export interface TrackShipmentResult {
  status: ShipmentTrackingStatus;
  lastUpdatedAt: string;
  checkpoints: { status: string; location: string; timestamp: string }[];
}

export interface GatewayCredentials {
  [key: string]: string;
}

/**
 * Every carrier implements exactly this — the shipping/order services only
 * ever depend on this interface, never a vendor SDK type, mirroring the
 * payment provider abstraction (providers/payment/payment.interface.ts).
 */
export interface ShippingProvider {
  readonly name: string;
  createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult>;
  trackShipment(carrierShipmentId: string): Promise<TrackShipmentResult>;
  cancelShipment(carrierShipmentId: string): Promise<{ cancelled: boolean }>;
}
