import { PdfService } from './pdf.service';

describe('PdfService', () => {
  let service: PdfService;

  beforeEach(() => {
    service = new PdfService();
  });

  const baseInvoice = {
    orderNumber: 'ORD-2024-001',
    createdAt: new Date('2024-07-20'),
    currency: 'INR',
    items: [
      { sku: 'SKU-BLK-001', quantity: 2, unitPriceCents: 89900 },
      { sku: 'SKU-WHT-001', quantity: 1, unitPriceCents: 49900 },
    ],
    subtotalCents: 229700,
    discountCents: 0,
    totalCents: 229700,
  };

  describe('generateInvoiceHtml', () => {
    it('returns a valid HTML string', () => {
      const html = service.generateInvoiceHtml(baseInvoice);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('contains the order number', () => {
      const html = service.generateInvoiceHtml(baseInvoice);
      expect(html).toContain('ORD-2024-001');
    });

    it('contains all SKUs', () => {
      const html = service.generateInvoiceHtml(baseInvoice);
      expect(html).toContain('SKU-BLK-001');
      expect(html).toContain('SKU-WHT-001');
    });

    it('renders a discount row when discountCents > 0', () => {
      const html = service.generateInvoiceHtml({ ...baseInvoice, discountCents: 10000, couponCode: 'SAVE10' });
      expect(html).toContain('SAVE10');
      expect(html).toContain('Discount');
    });

    it('omits discount row when discountCents is 0', () => {
      const html = service.generateInvoiceHtml(baseInvoice);
      expect(html).not.toContain('Discount');
    });

    it('renders billing email when provided', () => {
      const html = service.generateInvoiceHtml({ ...baseInvoice, contactEmail: 'customer@example.com' });
      expect(html).toContain('customer@example.com');
    });

    it('renders store name when provided', () => {
      const html = service.generateInvoiceHtml({ ...baseInvoice, storeName: 'Glacier Store' });
      expect(html).toContain('Glacier Store');
    });
  });
});
