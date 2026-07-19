import { Logger } from '@nestjs/common';
import {
  CreateShipmentParams,
  CreateShipmentResult,
  GatewayCredentials,
  ShipmentTrackingStatus,
  ShippingProvider,
  TrackShipmentResult,
} from '../shipping.interface';

const SHIPROCKET_API_BASE = 'https://apiv2.shiprocket.in/v1/external';

// Shiprocket's tracking statuses, mapped to our normalized set.
const STATUS_MAP: Record<string, ShipmentTrackingStatus> = {
  'NEW': 'label_created',
  'PICKUP GENERATED': 'label_created',
  'PICKED UP': 'picked_up',
  'IN TRANSIT': 'in_transit',
  'OUT FOR DELIVERY': 'out_for_delivery',
  'DELIVERED': 'delivered',
  'UNDELIVERED': 'failed',
  'RTO INITIATED': 'rto',
  'RTO DELIVERED': 'rto',
};

export class ShiprocketProvider implements ShippingProvider {
  readonly name = 'shiprocket';
  private readonly logger = new Logger(ShiprocketProvider.name);
  private readonly email: string;
  private readonly password: string;
  private token: string | null = null;

  constructor(credentials: GatewayCredentials) {
    this.email = credentials.email;
    this.password = credentials.password;
    if (!this.email || !this.password) {
      throw new Error('Shiprocket provider requires email and password credentials');
    }
  }

  private async getToken(): Promise<string> {
    if (this.token) return this.token;

    const response = await fetch(`${SHIPROCKET_API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });

    if (!response.ok) {
      throw new Error(`Shiprocket auth failed: ${response.status}`);
    }

    const data = (await response.json()) as { token: string };
    this.token = data.token;
    return this.token;
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  async createShipment(params: CreateShipmentParams): Promise<CreateShipmentResult> {
    const headers = await this.authHeaders();

    const response = await fetch(`${SHIPROCKET_API_BASE}/orders/create/adhoc`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        order_id: params.orderReference,
        order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        billing_customer_name: params.destination.name,
        billing_phone: params.destination.phone,
        billing_address: params.destination.line1,
        billing_address_2: params.destination.line2 || '',
        billing_city: params.destination.city,
        billing_state: params.destination.state,
        billing_pincode: params.destination.pincode,
        billing_country: params.destination.country,
        shipping_is_billing: true,
        order_items: params.items.map((item) => ({
          name: item.name,
          sku: item.sku,
          units: item.quantity,
          selling_price: item.unitPriceCents / 100,
        })),
        payment_method: params.codAmountCents ? 'COD' : 'Prepaid',
        sub_total: params.items.reduce((s, i) => s + (i.unitPriceCents / 100) * i.quantity, 0),
        weight: params.weightGrams / 1000, // Shiprocket wants kg
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      this.logger.error(`Shiprocket createShipment failed: ${response.status} ${errBody}`);
      throw new Error('Failed to create Shiprocket shipment');
    }

    const data = (await response.json()) as {
      shipment_id: number;
      awb_code?: string;
      order_id: number;
    };

    return {
      carrierShipmentId: data.shipment_id.toString(),
      trackingNumber: data.awb_code || '',
      trackingUrl: data.awb_code
        ? `https://shiprocket.co/tracking/${data.awb_code}`
        : '',
    };
  }

  async trackShipment(carrierShipmentId: string): Promise<TrackShipmentResult> {
    const headers = await this.authHeaders();

    const response = await fetch(
      `${SHIPROCKET_API_BASE}/courier/track/shipment/${carrierShipmentId}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(`Shiprocket tracking lookup failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      tracking_data?: {
        shipment_track?: { current_status: string }[];
        shipment_track_activities?: { status: string; location: string; date: string }[];
      };
    };

    const currentStatusRaw =
      data.tracking_data?.shipment_track?.[0]?.current_status?.toUpperCase() || 'NEW';

    return {
      status: STATUS_MAP[currentStatusRaw] || 'in_transit',
      lastUpdatedAt: new Date().toISOString(),
      checkpoints: (data.tracking_data?.shipment_track_activities || []).map((a) => ({
        status: a.status,
        location: a.location,
        timestamp: a.date,
      })),
    };
  }

  async cancelShipment(carrierShipmentId: string): Promise<{ cancelled: boolean }> {
    const headers = await this.authHeaders();

    const response = await fetch(`${SHIPROCKET_API_BASE}/orders/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids: [carrierShipmentId] }),
    });

    return { cancelled: response.ok };
  }
}
