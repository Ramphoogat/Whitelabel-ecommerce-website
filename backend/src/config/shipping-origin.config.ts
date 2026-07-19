import { registerAs } from '@nestjs/config';

// TEMPORARY: once the Organization module exists, the store's origin address
// should live in organization.settings (DB-driven, editable from the admin
// panel) instead of ENV. This is a stand-in so Shipping can function before
// that module is built — swap ShippingService's origin lookup over when it
// lands, and this config file can be deleted.
export default registerAs('shippingOrigin', () => ({
  name: process.env.STORE_ORIGIN_NAME || 'Store Warehouse',
  phone: process.env.STORE_ORIGIN_PHONE || '',
  line1: process.env.STORE_ORIGIN_LINE1 || '',
  line2: process.env.STORE_ORIGIN_LINE2 || '',
  city: process.env.STORE_ORIGIN_CITY || '',
  state: process.env.STORE_ORIGIN_STATE || '',
  pincode: process.env.STORE_ORIGIN_PINCODE || '',
  country: process.env.STORE_ORIGIN_COUNTRY || 'India',
}));
