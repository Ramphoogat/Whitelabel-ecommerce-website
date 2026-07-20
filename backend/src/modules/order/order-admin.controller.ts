import { Body, Controller, Get, Param, Patch, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { OrderService } from './order.service';
import { TransitionOrderStatusDto } from './dto/transition-order-status.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { OrderStatus } from './schemas/order.schema';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtStaffPayload } from '../../shared/interfaces/jwt-payload.interface';
import { AuditService } from '../audit/audit.service';
import { PdfService } from '../../providers/pdf/pdf.service';

@ApiTags('admin-orders')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/orders')
export class OrderAdminController {
  constructor(
    private readonly orderService: OrderService,
    private readonly auditService: AuditService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List orders, optionally filtered by status' })
  list(@Query('status') status?: OrderStatus) {
    return this.orderService.listOrders(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one order' })
  get(@Param('id') id: string) {
    return this.orderService.getOrder(id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Download a print-ready HTML invoice for an order' })
  async invoice(@Param('id') id: string, @Res() res: Response) {
    const order = await this.orderService.getOrder(id);
    const html = this.pdfService.generateInvoiceHtml({
      orderNumber: order.orderNumber,
      createdAt: (order as any).createdAt,
      currency: order.currency,
      items: order.items.map((i) => ({
        sku: i.sku,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
      })),
      subtotalCents: order.totalCents + order.discountCents,
      discountCents: order.discountCents,
      totalCents: order.totalCents,
      couponCode: order.couponCode,
      contactEmail: order.contactEmail,
    });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="invoice-${order.orderNumber}.html"`);
    res.send(html);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition an order to a new status (validated against the state machine)' })
  async transition(
    @Param('id') id: string,
    @Body() dto: TransitionOrderStatusDto,
    @CurrentUser() actor: JwtStaffPayload,
  ) {
    const previousOrder = await this.orderService.getOrder(id);
    const order = await this.orderService.transitionStatus(id, dto.status);

    await this.auditService.log(actor, 'order.status_changed', 'Order', id, {
      from: previousOrder.status,
      to: dto.status,
    });

    return order;
  }
}
