import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CheckoutSession, CheckoutSessionDocument } from '../order/schemas/checkout-session.schema';
import { PaymentGatewayConfigService } from './payment-gateway-config.service';
import { createPaymentProvider } from '../../providers/payment/payment.factory';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentGatewaySelectionService {
  constructor(
    @InjectModel(CheckoutSession.name)
    private readonly sessionModel: Model<CheckoutSessionDocument>,
    private readonly gatewayConfigService: PaymentGatewayConfigService,
    private readonly orderService: OrderService,
  ) {}

  /**
   * §6.4 step 4 of the architecture doc: server-side validates the chosen
   * gateway is actually active before doing anything — never trusts the
   * client's claim that a gateway is available.
   */
  async selectGateway(sessionId: string, mode: string, gatewayName: string) {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Checkout session not found');
    if (session.status !== 'awaiting_payment') {
      throw new BadRequestException(
        `Session is "${session.status}" — a gateway can only be selected while it is "awaiting_payment"`,
      );
    }

    const options = await this.gatewayConfigService.getCheckoutPaymentOptions();
    const modeOption = options.modes.find((m) => m.code === mode);
    if (!modeOption || !modeOption.gateways.includes(gatewayName)) {
      throw new BadRequestException(
        `Gateway "${gatewayName}" is not currently active for mode "${mode}"`,
      );
    }

    // Cash on Delivery has no gateway order to wait for — the order is
    // created immediately, since there's no async payment confirmation
    // coming via webhook the way there is for every gateway-backed mode.
    if (mode === 'cod') {
      session.paymentMode = mode;
      session.paymentGateway = 'cod';
      await session.save();

      const order = await this.orderService.createOrderFromPaidSession(
        sessionId,
        'cod',
        `cod_${sessionId}`,
        'pending',
      );

      return { mode, gateway: 'cod', clientPayload: {}, orderId: order._id };
    }

    const credentials = await this.gatewayConfigService.getDecryptedCredentials(gatewayName);
    const provider = createPaymentProvider(gatewayName, credentials);

    const result = await provider.createOrder({
      amountInPaise: session.totalCents,
      currency: session.currency,
      receiptId: sessionId,
    });

    session.paymentMode = mode;
    session.paymentGateway = gatewayName;
    session.gatewayOrderId = result.gatewayOrderId;
    await session.save();

    return { mode, gateway: gatewayName, clientPayload: result.clientPayload };
  }
}
