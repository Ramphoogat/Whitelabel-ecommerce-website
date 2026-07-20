import { Injectable } from '@nestjs/common';

interface InvoiceData {
  orderNumber: string;
  createdAt: Date;
  currency: string;
  items: { sku: string; quantity: number; unitPriceCents: number }[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  couponCode?: string | null;
  contactEmail?: string | null;
  storeName?: string;
  storeAddress?: string;
}

@Injectable()
export class PdfService {
  /** Generates a print-ready HTML invoice string. */
  generateInvoiceHtml(data: InvoiceData): string {
    const fmt = (cents: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: data.currency || 'INR',
        minimumFractionDigits: 2,
      }).format(cents / 100);

    const rows = data.items
      .map(
        (item) => `
        <tr>
          <td>${item.sku}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td style="text-align:right">${fmt(item.unitPriceCents)}</td>
          <td style="text-align:right">${fmt(item.unitPriceCents * item.quantity)}</td>
        </tr>`,
      )
      .join('');

    const discountRow =
      data.discountCents > 0
        ? `<tr><td colspan="3" style="text-align:right">Discount${data.couponCode ? ` (${data.couponCode})` : ''}</td><td style="text-align:right;color:#e53">-${fmt(data.discountCents)}</td></tr>`
        : '';

    const date = new Date(data.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Invoice ${data.orderNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .store-name { font-size: 22px; font-weight: 700; letter-spacing: -.5px; }
  .store-address { color: #666; margin-top: 4px; font-size: 12px; line-height: 1.5; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #4b9ec4; }
  .invoice-meta p { color: #666; margin-top: 4px; font-size: 12px; }
  .divider { border: none; border-top: 1px solid #e8e8e8; margin: 24px 0; }
  .bill-to { margin-bottom: 32px; }
  .bill-to h3 { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 6px; }
  .bill-to p { font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #f7f7f7; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .8px; color: #666; font-weight: 600; }
  tbody td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
  .totals { width: 260px; margin-left: auto; }
  .totals tr td { padding: 6px 0; }
  .totals tr td:first-child { color: #666; }
  .totals tr td:last-child { text-align: right; font-weight: 500; }
  .totals .grand-total td { font-size: 15px; font-weight: 700; border-top: 2px solid #1a1a1a; padding-top: 10px; margin-top: 4px; }
  .footer { text-align: center; color: #aaa; font-size: 11px; margin-top: 60px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="store-name">${data.storeName || 'Store'}</div>
    <div class="store-address">${(data.storeAddress || '').replace(/\n/g, '<br>')}</div>
  </div>
  <div class="invoice-meta">
    <h2>Invoice</h2>
    <p>#${data.orderNumber}</p>
    <p>${date}</p>
  </div>
</div>

<hr class="divider">

${data.contactEmail ? `<div class="bill-to"><h3>Bill To</h3><p>${data.contactEmail}</p></div>` : ''}

<table>
  <thead>
    <tr>
      <th>SKU / Item</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Unit Price</th>
      <th style="text-align:right">Total</th>
    </tr>
  </thead>
  <tbody>
    ${rows}
  </tbody>
</table>

<table class="totals">
  <tbody>
    <tr><td>Subtotal</td><td>${fmt(data.subtotalCents ?? data.totalCents + data.discountCents)}</td></tr>
    ${discountRow}
    <tr class="grand-total"><td>Total</td><td>${fmt(data.totalCents)}</td></tr>
  </tbody>
</table>

<div class="footer">Thank you for your order.</div>
</body>
</html>`;
  }
}
