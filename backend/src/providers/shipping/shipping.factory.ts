import { BadRequestException } from '@nestjs/common';
import { GatewayCredentials, ShippingProvider } from './shipping.interface';
import { ShiprocketProvider } from './gateways/shiprocket.provider';

// Add one entry here per new carrier file — nothing else in the app changes.
const CARRIER_REGISTRY: Record<
  string,
  new (credentials: GatewayCredentials) => ShippingProvider
> = {
  shiprocket: ShiprocketProvider,
  // delhivery: DelhiveryProvider,
  // bluedart: BluedartProvider,
  // xpressbees: XpressbeesProvider,
  // dtdc: DtdcProvider,
};

export function createShippingProvider(
  carrierName: string,
  credentials: GatewayCredentials,
): ShippingProvider {
  const ProviderClass = CARRIER_REGISTRY[carrierName];
  if (!ProviderClass) {
    throw new BadRequestException(`Unknown or unimplemented shipping carrier: ${carrierName}`);
  }
  return new ProviderClass(credentials);
}

export const SUPPORTED_CARRIERS = Object.keys(CARRIER_REGISTRY);
