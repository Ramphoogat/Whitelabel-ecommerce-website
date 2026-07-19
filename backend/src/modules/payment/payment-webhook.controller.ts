import {
  BadRequestException,
  Controller,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentGatewayConfigService } from './payment-gateway-config.service';
import { PaymentWebhookService } from './payment-webhook.service';
import { createPaymentProvider } from '../../providers/payment/payment.factory';
import { Public } from '../../shared/decorators/public.decorator';

// Excluded from Swagger — gateways call this directly, it's not meant to be
// browsed/tested from the docs UI, and its raw-body requirement doesn't play
// well with the Swagger "Try it out" JSON editor anyway.
@ApiExcludeController()
@Public()
@Controller('webhooks')
export class PaymentWebhookController {
  constructor(
    private readonly gatewayConfigService: PaymentGatewayConfigService,
    private readonly webhookService: PaymentWebhookService,
  ) {}

  @Post(':provider')
  async handleWebhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') razorpaySignature: string | undefined,
    @Headers('stripe-signature') stripeSignature: string | undefined,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Raw body not available — check rawBody:true in main.ts');
    }
    const rawBody = req.rawBody.toString('utf8');
    const signatureHeader = provider === 'stripe' ? stripeSignature : razorpaySignature;
    if (!signatureHeader) {
      throw new BadRequestException(`Missing signature header for provider "${provider}"`);
    }

    const credentials = await this.gatewayConfigService.getDecryptedCredentials(provider);
    const paymentProvider = createPaymentProvider(provider, credentials);
    const isValid = paymentProvider.verifyWebhookSignature(rawBody, signatureHeader);
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const body = JSON.parse(rawBody) as Record<string, any>;
    const parsed = this.extractEventDetails(provider, body);

    const { isNew } = await this.webhookService.recordAndEnqueue(
      provider,
      parsed.providerEventId,
      body,
      {
        provider,
        providerEventId: parsed.providerEventId,
        eventType: parsed.eventType,
        gatewayOrderId: parsed.gatewayOrderId,
        gatewayPaymentId: parsed.gatewayPaymentId,
      },
    );

    return { received: true, deduplicated: !isNew };
  }

  private extractEventDetails(
    provider: string,
    body: Record<string, any>,
  ): {
    providerEventId: string;
    eventType: string;
    gatewayOrderId: string;
    gatewayPaymentId: string;
  } {
    if (provider === 'stripe') {
      const intent = body.data?.object ?? {};
      return {
        providerEventId: body.id,
        eventType: body.type,
        gatewayOrderId: intent.id,
        gatewayPaymentId: intent.id,
      };
    }

    if (provider === 'razorpay') {
      const entity = body.payload?.payment?.entity ?? {};
      return {
        providerEventId: `${body.event}_${entity.id}`,
        eventType: body.event,
        gatewayOrderId: entity.order_id,
        gatewayPaymentId: entity.id,
      };
    }

    throw new BadRequestException(`Unsupported webhook provider: ${provider}`);
  }
}
